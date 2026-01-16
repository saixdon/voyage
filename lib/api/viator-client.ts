// Viator Partner API Client
// Documentation: https://docs.viator.com/partner-api/technical/

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.sandbox.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

interface ViatorProduct {
    productCode: string;
    title: string;
    description?: string;
    images?: { variants: { url: string; width?: number; height?: number }[] }[];
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

// Helper to select the best image resolution (prefer 720px+ width)
function selectBestImage(images?: ViatorProduct["images"]): string {
    if (!images || images.length === 0) return "";

    const variants = images[0]?.variants;
    if (!variants || variants.length === 0) return "";

    // Try to find an image with width >= 720px
    const hdImage = variants.find(v => v.width && v.width >= 720);
    if (hdImage) return hdImage.url;

    // If no HD image, try to find the largest one
    const sorted = [...variants].sort((a, b) => (b.width || 0) - (a.width || 0));
    return sorted[0]?.url || "";
}

// Cache for destinations to avoid repeated API calls
let destinationsCache: { destinationId: number; name: string; type: string }[] | null = null;
let destinationsCacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fetch all destinations from Viator and cache them
async function fetchAllDestinations(): Promise<{ destinationId: number; name: string; type: string }[]> {
    // Return cached data if still valid
    if (destinationsCache && Date.now() - destinationsCacheTime < CACHE_DURATION) {
        return destinationsCache;
    }

    if (!VIATOR_API_KEY) return [];

    try {
        const response = await fetch(`${VIATOR_API_BASE}/destinations`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": "en",
                "exp-api-key": VIATOR_API_KEY,
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch destinations:", response.status);
            return [];
        }

        const data = await response.json();
        if (data.destinations && Array.isArray(data.destinations)) {
            destinationsCache = data.destinations;
            destinationsCacheTime = Date.now();
            console.log(`Cached ${data.destinations.length} Viator destinations`);
            return data.destinations;
        }
        return [];
    } catch (error) {
        console.error("Viator Destinations Fetch Error:", error);
        return [];
    }
}

// Helper to find destination ID for a city name by searching cached destinations
async function resolveDestinationId(query: string): Promise<string | null> {
    const destinations = await fetchAllDestinations();
    if (destinations.length === 0) return null;

    const queryLower = query.toLowerCase().trim();

    // 1. Try exact match first (case-insensitive)
    let match = destinations.find(d => d.name.toLowerCase() === queryLower);

    // 2. Try starts-with match
    if (!match) {
        match = destinations.find(d => d.name.toLowerCase().startsWith(queryLower));
    }

    // 3. Try contains match
    if (!match) {
        match = destinations.find(d => d.name.toLowerCase().includes(queryLower));
    }

    // 4. Try if query contains destination name
    if (!match) {
        match = destinations.find(d => queryLower.includes(d.name.toLowerCase()));
    }

    if (match) {
        console.log(`Resolved "${query}" to destination: ${match.name} (ID: ${match.destinationId})`);
        return match.destinationId.toString();
    }

    console.warn(`Could not resolve destination for: ${query}`);
    return null;
}

export async function searchViatorProducts(
    query: string,
    limit = 20
): Promise<{ activities: TransformedActivity[]; totalCount?: number; error?: string }> {
    if (!VIATOR_API_KEY) {
        return { activities: [], error: "Viator API key not configured" };
    }

    try {
        // 1. Resolve Destination ID mainly because /products/search REQUIRES a destination filter
        // We try to find a destination matching the query string.
        const destinationId = await resolveDestinationId(query);

        if (!destinationId) {
            console.warn(`Could not resolve destination for query: ${query}`);
            // If we can't find a destination, we probably won't find products easily with /products/search
            // However, we can try to search without filtering if the API allows it, or return empty.
            // Based on tests, filtering is strict. fallback to no results.
            return { activities: [], error: `Could not find destination: ${query}` };
        }

        // 2. Search products with the found Destination ID
        const response = await fetch(`${VIATOR_API_BASE}/products/search`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": "de",
                "exp-api-key": VIATOR_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                searchTerm: query, // Still verify text match + destination
                pagination: {
                    start: 1,
                    count: limit,
                },
                filtering: {
                    destination: destinationId,
                },
                sorting: {
                    sort: "TRAVELER_RATING",
                    order: "DESC",
                },
                currency: "EUR",
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
            image: selectBestImage(product.images),
            price: product.pricing?.summary?.fromPrice || 0,
            currency: product.pricing?.currency || "EUR",
            rating: product.reviews?.combinedAverageRating || 0,
            reviewCount: product.reviews?.totalReviews || 0,
            duration: formatDuration(product.duration),
            productCode: product.productCode,
        }));

        // Secondary manual sort to ensure best results are at the top
        // (Viator API sorting can sometimes be inconsistent with 0-rating products)
        activities.sort((a, b) => {
            // First by rating (DESC)
            if (b.rating !== a.rating) {
                return b.rating - a.rating;
            }
            // Then by review count (DESC)
            return b.reviewCount - a.reviewCount;
        });

        return { activities, totalCount: data.totalCount };
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { activities: [], totalCount: 0, error: "Failed to fetch from Viator API" };
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
