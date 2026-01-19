
/**
 * Viator Affiliate Link Generator
 * 
 * Generates "Just-in-Time" affiliate links for Viator products.
 * Uses the Hybrid Model where we browse with API but link out for booking.
 */

// Use NEXT_PUBLIC for client-side access
const VIATOR_PID = process.env.NEXT_PUBLIC_VIATOR_PID || process.env.VIATOR_PID;

/**
 * Generates an affiliate link for a specific Viator product.
 * 
 * @param productUrl The absolute URL of the product on Viator (provided by API)
 * @param uid A unique identifier for the user or session (for sub-tracking) - optional
 * @param pid Optional Partner ID override (defaults to env var)
 * @returns The complete affiliate URL
 */
export function generateAffiliateLink(
    productUrl: string,
    uid?: string,
    pid: string = VIATOR_PID || ''
): string {
    if (!productUrl) return '';
    if (!pid) {
        console.warn('VIATOR_PID is not set. Generated link will not be tracked.');
    }

    try {
        // Handle relative URLs
        let fullUrl = productUrl;
        if (!productUrl.startsWith('http')) {
            fullUrl = `https://www.viator.com${productUrl.startsWith('/') ? '' : '/'}${productUrl}`;
        }

        const url = new URL(fullUrl);

        // Add Affiliate Parameters
        if (pid) {
            url.searchParams.set('pid', pid);
        }

        if (uid) {
            url.searchParams.set('uid', uid);
        }

        return url.toString();
    } catch (e) {
        console.error('Invalid product URL provided to generateAffiliateLink', productUrl);
        return productUrl;
    }
}

