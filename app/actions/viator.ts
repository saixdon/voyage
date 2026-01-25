'use server';

import { getViatorAvailability, getViatorProductDetails, searchViatorProducts, getViatorProductSchedule } from '@/lib/api/viator-client';
import { generateAffiliateLink } from '@/lib/api/viator-affiliate';
import { randomUUID } from 'crypto'; // For UID generation
import { format, addDays } from 'date-fns';

export interface SimilarProduct {
    productCode: string;
    title: string;
    image: string;
    price: number;
    currency: string;
    rating: number;
    reviewCount: number;
}

export interface AvailabilityResult {
    available: boolean;
    price?: {
        amount: number;
        currency: string;
    };
    affiliateUrl?: string;
    bookableItems?: any[]; // Array of available options/times
    error?: string;
    nextAvailableDate?: string; // YYYY-MM-DD format
    similarProducts?: SimilarProduct[];
}

/**
 * Server Action to check availability for a specific product and date.
 * Wraps the internal API client to be safe for client-side usage.
 * Enhanced to find next available date and similar products when not available.
 */
export async function checkAvailabilityAction(
    productCode: string,
    date: string,
    guestCount: number = 2,
    destination?: string, // Optional destination for similar products search
    productOptionCode?: string
): Promise<AvailabilityResult> {
    if (!productCode || !date) {
        return { available: false, error: 'Missing parameters' };
    }

    try {
        const paxMix = [{ ageBand: "ADULT", numberOfTravelers: guestCount }];
        const result = await getViatorAvailability(productCode, date, paxMix, productOptionCode);

        if (result.error) {
            console.error('Availability check failed:', result.error);
            let userError = result.error;
            if (result.error.includes('401')) {
                userError = "Viator API Key is invalid or not yet active. Please check your .env file and restart the server.";
            } else if (result.error.includes('403')) {
                userError = "Access denied by Viator API. Please check your API permissions.";
            }
            return { available: false, error: userError };
        }

        // Parse the response to determine simple availability status
        const isAvailable = result.bookableItems && result.bookableItems.length > 0;

        // Match the correct item if option code is provided
        let selectedItem = result.bookableItems ? result.bookableItems[0] : null;
        if (productOptionCode && result.bookableItems && result.bookableItems.length > 1) {
            selectedItem = result.bookableItems.find((i: any) => i.productOptionCode === productOptionCode) || result.bookableItems[0];
        }

        // Extract the price for the specific option
        let price;
        if (isAvailable && selectedItem?.totalPrice) {
            const priceObj = selectedItem.totalPrice.price;
            price = {
                amount: priceObj.value || priceObj.recommendedRetailPrice || 0,
                currency: result.currency || 'EUR'
            };
        }

        // Generate Affiliate Link ONLY if available
        let affiliateUrl;
        let nextAvailableDate: string | undefined;
        let similarProducts: SimilarProduct[] | undefined;

        if (isAvailable) {
            const product = await getViatorProductDetails(productCode);
            const productUrl = product.productUrl || `https://www.viator.com/tours/standard/${productCode}`;
            const uid = randomUUID();
            affiliateUrl = generateAffiliateLink(productUrl, uid);
        } else {
            // NOT AVAILABLE - Find next available date and similar products

            // 1. Search for next available date using Schedule API (Efficient)
            const selectedDate = new Date(date);
            try {
                // Optimized Loop strategy: Check next 60 days in parallel batches
                const datesToCheck = [];
                for (let i = 1; i <= 60; i++) {
                    datesToCheck.push(format(addDays(selectedDate, i), 'yyyy-MM-dd'));
                }

                // Check in batches of 5 to avoid rate limits
                for (let i = 0; i < datesToCheck.length; i += 5) {
                    if (nextAvailableDate) break;
                    const batch = datesToCheck.slice(i, i + 5);
                    const results = await Promise.all(batch.map(d => getViatorAvailability(productCode, d, paxMix, productOptionCode).then(res => ({ date: d, available: res.bookableItems?.length > 0 })).catch(() => ({ date: d, available: false }))));

                    const found = results.find(r => r.available);
                    if (found) {
                        nextAvailableDate = found.date;
                        break;
                    }
                }

            } catch (e) {
                console.error("Next date search failed", e);
            }

            // 2. Fetch similar products from the same destination
            if (destination) {
                try {
                    const searchResult = await searchViatorProducts(
                        destination,
                        4, // Get 4 similar products
                        undefined,
                        undefined,
                        'en',
                        { destinationId: undefined }
                    );

                    if (searchResult.activities && searchResult.activities.length > 0) {
                        similarProducts = searchResult.activities
                            .filter(a => a.productCode !== productCode) // Exclude current product
                            .slice(0, 3) // Take up to 3
                            .map(a => ({
                                productCode: a.productCode,
                                title: a.title,
                                image: a.image,
                                price: a.price,
                                currency: a.currency,
                                rating: a.rating,
                                reviewCount: a.reviewCount
                            }));
                    }
                } catch (e) {
                    console.error('Failed to fetch similar products:', e);
                }
            }
        }

        return {
            available: isAvailable,
            price,
            affiliateUrl,
            bookableItems: result.bookableItems,
            nextAvailableDate,
            similarProducts
        };

    } catch (error) {
        console.error('Server action error:', error);
        return { available: false, error: 'Internal server error' };
    }
}
