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
    destination?: string // Optional destination for similar products search
): Promise<AvailabilityResult> {
    if (!productCode || !date) {
        return { available: false, error: 'Missing parameters' };
    }

    try {
        const result = await getViatorAvailability(productCode, date);

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

        // Extract the lowest price found for this date
        let price;
        if (isAvailable && result.bookableItems[0].totalPrice) {
            const priceObj = result.bookableItems[0].totalPrice.price;
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
                const schedule = await getViatorProductSchedule(productCode);
                if (schedule && schedule.availabilitySchedules) {
                    // Find first date in schedule strictly after selectedDate
                    // Schedule uses "2024-05-20" format
                    const availableDates = schedule.availabilitySchedules
                        .flatMap((s: any) => s.bookableItems.flatMap((b: any) => b.seasons.flatMap((season: any) => {
                            // This is complex to parse manually without exact season structure knowledge
                            // Simpler: The schedule endpoint usually returns a summary or we iterate seasons
                            // Actually, let's look at the structure of availability/schedules response:
                            // It has bookableItems -> seasons -> startDate/endDate + daysOfWeek
                            return [];
                        })));

                    // Implementing simplified "next date" logic from valid seasons is complex
                    // Fallback: If schedule API is complex to parse on server without helpers, 
                    // maybe sticking to a slightly smarter loop is safer for now OR just checking 14 days.

                    // Actually, let's stick to the loop but extend it to 14 days and use Promise.all for blocks
                    // Parsing seasons is error prone without types.
                }

                // Optimized Loop strategy: Check next 14 days in parallel batches
                const datesToCheck = [];
                for (let i = 1; i <= 14; i++) {
                    datesToCheck.push(format(addDays(selectedDate, i), 'yyyy-MM-dd'));
                }

                // Check in batches of 5 to avoid rate limits
                for (let i = 0; i < datesToCheck.length; i += 5) {
                    if (nextAvailableDate) break;
                    const batch = datesToCheck.slice(i, i + 5);
                    const results = await Promise.all(batch.map(d => getViatorAvailability(productCode, d).then(res => ({ date: d, available: res.bookableItems?.length > 0 })).catch(() => ({ date: d, available: false }))));

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
