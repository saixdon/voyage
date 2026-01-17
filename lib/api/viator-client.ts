// Viator Partner API Client
// Documentation: https://docs.viator.com/partner-api/technical/

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
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

// Cache for tags
let tagsCache: ViatorTag[] | null = null;
let tagsCacheTime = 0;

export interface ViatorTag {
    tagId: number;
    allNamesByLocale: Record<string, string>;
    parentTagIds?: number[];
}

export interface TransformedTag {
    id: number;
    name: string;
    icon: string;
    query: string;
}

// Icon mapping for common tag categories
const TAG_ICON_MAPPING: Record<string, string> = {
    // Food & Drink
    "food": "restaurant",
    "drink": "restaurant",
    "culinary": "restaurant",
    "wine": "wine_bar",
    "beer": "sports_bar",
    "cooking": "soup_kitchen",
    // Sports & Adventures
    "sports": "sports_basketball",
    "adventure": "hiking",
    "hiking": "hiking",
    "biking": "pedal_bike",
    "cycling": "pedal_bike",
    "climbing": "landscape",
    "skiing": "downhill_skiing",
    "golf": "golf_course",
    // Culture & History
    "culture": "museum",
    "cultural": "museum",
    "museum": "museum",
    "history": "account_balance",
    "historical": "account_balance",
    "art": "palette",
    "architecture": "domain",
    "heritage": "castle",
    // Nature & Outdoors
    "nature": "landscape",
    "outdoor": "park",
    "park": "park",
    "garden": "yard",
    "wildlife": "pets",
    "safari": "pets",
    "mountain": "terrain",
    "forest": "forest",
    // Water Activities
    "water": "sailing",
    "beach": "beach_access",
    "diving": "scuba_diving",
    "snorkeling": "scuba_diving",
    "boat": "sailing",
    "cruise": "directions_boat",
    "kayak": "kayaking",
    "surfing": "surfing",
    "swimming": "pool",
    // Tours & Sightseeing
    "tour": "tour",
    "sightseeing": "visibility",
    "walking": "directions_walk",
    "bus": "directions_bus",
    "city": "location_city",
    // Entertainment
    "entertainment": "celebration",
    "show": "theater_comedy",
    "nightlife": "nightlife",
    "music": "music_note",
    "concert": "music_note",
    // Wellness
    "spa": "spa",
    "wellness": "spa",
    "yoga": "self_improvement",
    "relaxation": "self_improvement",
    // Shopping
    "shopping": "shopping_bag",
    "market": "storefront",
    // Default
    "default": "explore",
};

// Get icon for a tag based on its name
function getIconForTag(tagName: string): string {
    const nameLower = tagName.toLowerCase();

    for (const [keyword, icon] of Object.entries(TAG_ICON_MAPPING)) {
        if (nameLower.includes(keyword)) {
            return icon;
        }
    }

    return TAG_ICON_MAPPING.default;
}

export interface TrendingDestination {
    id: number;
    name: string;
    country: string;
    image: string;
    query: string;
}

const TRENDING_DESTINATION_IDS = [
    { id: 711, name: "Rome", country: "Italy", query: "Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop" },
    { id: 479, name: "Paris", country: "France", query: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop" },
    { id: 562, name: "Barcelona", country: "Spain", query: "Barcelona", image: "https://images.unsplash.com/photo-1583997051651-8255c48b782c?q=80&w=1000&auto=format&fit=crop" },
    { id: 674, name: "New York", country: "USA", query: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop" },
    { id: 737, name: "London", country: "UK", query: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop" }
];

export async function getTrendingDestinations(): Promise<TrendingDestination[]> {
    // In a real scenario, we could fetch these from Viator, but for now we use 
    // these IDs to ensure we get high-quality content for the landing page.
    return TRENDING_DESTINATION_IDS;
}

// Fetch all tags from Viator API
export async function fetchViatorTags(): Promise<ViatorTag[]> {
    // Return cached data if still valid
    if (tagsCache && Date.now() - tagsCacheTime < CACHE_DURATION) {
        return tagsCache;
    }

    if (!VIATOR_API_KEY) {
        console.error("Viator API key not configured");
        return [];
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/products/tags`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": "en",
                "exp-api-key": VIATOR_API_KEY,
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch tags:", response.status);
            return [];
        }

        const data = await response.json();
        if (data.tags && Array.isArray(data.tags)) {
            tagsCache = data.tags;
            tagsCacheTime = Date.now();
            console.log(`Cached ${data.tags.length} Viator tags`);
            return data.tags;
        }
        return [];
    } catch (error) {
        console.error("Viator Tags Fetch Error:", error);
        return [];
    }
}

// Curated main category tag IDs from Viator (these are the most relevant for travel)
// These IDs were identified from the Viator tag hierarchy
const CURATED_CATEGORY_CONFIG: { tagId: number; icon: string; fallbackName: string; query: string }[] = [
    { tagId: 21911, icon: "restaurant", fallbackName: "Food and Drink", query: "Food Tour" },
    { tagId: 21909, icon: "hiking", fallbackName: "Outdoor Activities", query: "Outdoor Adventure" },
    { tagId: 21910, icon: "museum", fallbackName: "Art and Culture", query: "Kultur Museum" },
    { tagId: 21912, icon: "confirmation_number", fallbackName: "Tickets", query: "Tickets Attractions" },
    { tagId: 21913, icon: "sailing", fallbackName: "Tours & Cruises", query: "Boat Tour Cruise" },
    { tagId: 21915, icon: "school", fallbackName: "Classes & Workshops", query: "Workshop Class" },
    { tagId: 21914, icon: "directions_bus", fallbackName: "Transport", query: "Transfer Airport" },
    { tagId: 21916, icon: "celebration", fallbackName: "Special Occasions", query: "Special Event" },
];

// Get transformed tags suitable for display
export async function getDisplayCategories(locale = "en"): Promise<TransformedTag[]> {
    const tags = await fetchViatorTags();

    if (tags.length === 0) {
        // Return curated categories with fallback names if API fails
        return CURATED_CATEGORY_CONFIG.map(config => ({
            id: config.tagId,
            name: config.fallbackName,
            icon: config.icon,
            query: config.query,
        }));
    }

    // Find our curated categories in the API response
    const categories: TransformedTag[] = [];

    for (const config of CURATED_CATEGORY_CONFIG) {
        const tag = tags.find(t => t.tagId === config.tagId);
        if (tag) {
            const name = tag.allNamesByLocale[locale] || tag.allNamesByLocale["en"] || config.fallbackName;
            categories.push({
                id: config.tagId,
                name,
                icon: config.icon,
                query: config.query,
            });
        } else {
            // Use fallback if tag not found
            categories.push({
                id: config.tagId,
                name: config.fallbackName,
                icon: config.icon,
                query: config.query,
            });
        }
    }

    return categories;
}

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
    limit = 20,
    startDate?: string, // YYYY-MM-DD
    endDate?: string    // YYYY-MM-DD
): Promise<{ activities: TransformedActivity[]; totalCount?: number; error?: string }> {
    if (!VIATOR_API_KEY) {
        return { activities: [], error: "Viator API key not configured" };
    }

    try {
        // 1. Resolve Destination ID mainly because /products/search REQUIRES a destination filter
        // We try to find a destination matching the query string.
        let destinationId = await resolveDestinationId(query);

        if (!destinationId) {
            console.warn(`Could not resolve destination for query: ${query}. Defaulting to London.`);
            // Fallback: If no destination matches (e.g. user searched "Food"), default to London
            // so we at least show some real products instead of nothing.
            destinationId = await resolveDestinationId("London");

            if (!destinationId) {
                return { activities: [], error: `Could not find destination: ${query}` };
            }
        }

        // 2. Search products with the found Destination ID
        const response = await fetch(`${VIATOR_API_BASE}/products/search`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": "en",
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
                    ...(startDate && { startDate: startDate }),
                    ...(endDate && { endDate: endDate }),
                },
                sorting: {
                    sort: "TRAVELER_RATING",
                    order: "DESCENDING",
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
                "Accept-Language": "en",
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
