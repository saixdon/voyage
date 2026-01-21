'use server';

import { getViatorAvailability, getViatorProductDetails } from '@/lib/api/viator-client';
import { generateAffiliateLink } from '@/lib/api/viator-affiliate';
import { randomUUID } from 'crypto'; // For UID generation

export interface AvailabilityResult {
    available: boolean;
    price?: {
        amount: number;
        currency: string;
    };
    affiliateUrl?: string;
    bookableItems?: any[]; // Array of available options/times
    error?: string;
}

/**
 * Server Action to check availability for a specific product and date.
 * Wraps the internal API client to be safe for client-side usage.
 */
export async function checkAvailabilityAction(
    productCode: string,
    date: string
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
        // The structure depends on the exact API response for /availability/check
        // Usually it returns bookableItems if available.

        // Example simplified check:
        const isAvailable = result.bookableItems && result.bookableItems.length > 0;

        // Extract the lowest price found for this date
        let price;
        if (isAvailable && result.bookableItems[0].totalPrice) {
            const priceObj = result.bookableItems[0].totalPrice.price;
            price = {
                amount: priceObj.value || priceObj.recommendedRetailPrice || 0,
                currency: result.currency || 'EUR' // The currency might be at root or inside price object
            };
        }

        // Generate Affiliate Link ONLY if available
        let affiliateUrl;
        if (isAvailable) {
            // We need the product URL to generate the affiliate link.
            // Ideally this is passed in, or we fetch it. 
            // For now, we will fetch product details to get the URL or construct a standard one.
            // Standard Viator Product URL: https://www.viator.com/tours/{location}/{title}/{productCode}
            // But we can also use a generic one if we don't have the SEO friendly URL:
            // https://www.viator.com/tours/a/b/{productCode} might redirect?
            // Safer to fetch details or just use productCode if generateAffiliateLink handles it?
            // generateAffiliateLink expects a URL.

            // Let's assume we can construct a functional URL:
            // https://www.viator.com/searchResults/all?text={productCode} is a fallback but bad UX.
            // Best is to use the `productUrl` from product details.

            // Optimization: Maybe pass productUrl from client? 
            // But client might not have it if it comes from our internal API which transforms it.
            // Let's quickly fetch details (cached) to be safe.
            const product = await getViatorProductDetails(productCode);
            const productUrl = product.productUrl || `https://www.viator.com/tours/standard/${productCode}`;

            // Generate a session UID
            const uid = randomUUID();

            affiliateUrl = generateAffiliateLink(productUrl, uid);
        }

        return {
            available: isAvailable,
            price,
            affiliateUrl,
            bookableItems: result.bookableItems
        };

    } catch (error) {
        console.error('Server action error:', error);
        return { available: false, error: 'Internal server error' };
    }
}
