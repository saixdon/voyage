// Viator Partner API Client
// Documentation: https://docs.viator.com/partner-api/technical/

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.sandbox.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

interface ViatorProduct {
    productCode: string;
    title: string;
    description?: string;
    images?: { variants: { url: string }[] }[];
    pricing?: {
        summary?: {
            fromPrice?: number;
            fromPriceBeforeDiscount?: number;
        };
        currency?: string;
    };
    reviews?: {
        combinedAverageRating?: number;
        totalReviews?: number;
    };
    duration?: {
        fixedDurationInMinutes?: number;
        variableDurationFromMinutes?: number;
        variableDurationToMinutes?: number;
    };
    destinations?: { ref: string; name?: string }[];
    tags?: { tagId: number; name?: string }[];
}

interface ViatorSearchResponse {
    products?: ViatorProduct[];
    totalCount?: number;
    error?: string;
}

export interface TransformedActivity {
    id: string;
    title: string;
    location: string;
    image: string;
    price: number;
    currency: string;
    rating: number;
    reviewCount: number;
    duration: string;
    productCode: string;
}

function formatDuration(duration?: ViatorProduct["duration"]): string {
    if (!duration) return "";

    if (duration.fixedDurationInMinutes) {
        const hours = Math.floor(duration.fixedDurationInMinutes / 60);
        const mins = duration.fixedDurationInMinutes % 60;
        if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
        if (hours > 0) return `${hours} hours`;
        return `${mins} min`;
    }

    if (duration.variableDurationFromMinutes && duration.variableDurationToMinutes) {
        const fromHours = Math.floor(duration.variableDurationFromMinutes / 60);
        const toHours = Math.floor(duration.variableDurationToMinutes / 60);
        return `${fromHours}-${toHours} hours`;
    }

    return "";
}

export async function searchViatorProducts(
    query: string,
    limit = 20
): Promise<{ activities: TransformedActivity[]; error?: string }> {
    if (!VIATOR_API_KEY) {
        return { activities: [], error: "Viator API key not configured" };
    }

    try {
        // Search products by destination or free text
        const response = await fetch(`${VIATOR_API_BASE}/products/search`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": "de",
                "exp-api-key": VIATOR_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                searchTerm: query,
                pagination: {
                    start: 1,
                    count: limit,
                },
                sorting: {
                    sort: "TRAVELER_RATING",
                    order: "DESC",
                },
            }),
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Viator API Error:", response.status, errorText);
            return { activities: [], error: `API Error: ${response.status}` };
        }

        const data: ViatorSearchResponse = await response.json();

        if (!data.products || data.products.length === 0) {
            return { activities: [], error: "No products found" };
        }

        // Transform Viator products to our Activity format
        const activities: TransformedActivity[] = data.products.map((product) => ({
            id: product.productCode,
            title: product.title,
            location: product.destinations?.[0]?.name || "",
            image: product.images?.[0]?.variants?.[0]?.url || "",
            price: product.pricing?.summary?.fromPrice || 0,
            currency: product.pricing?.currency || "EUR",
            rating: product.reviews?.combinedAverageRating || 0,
            reviewCount: product.reviews?.totalReviews || 0,
            duration: formatDuration(product.duration),
            productCode: product.productCode,
        }));

        return { activities };
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { activities: [], error: "Failed to fetch from Viator API" };
    }
}

export async function getViatorProductDetails(productCode: string) {
    if (!VIATOR_API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/products/${productCode}`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": "de",
                "exp-api-key": VIATOR_API_KEY,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch product details" };
    }
}

// Get availability for a product
export async function getViatorAvailability(
    productCode: string,
    travelDate: string // Format: YYYY-MM-DD
) {
    if (!VIATOR_API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/availability/check`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": VIATOR_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productCode,
                travelDate,
                currency: "EUR",
            }),
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to check availability" };
    }
}
