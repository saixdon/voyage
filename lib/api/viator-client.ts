// Viator Partner API Client
// Documentation: https://docs.viator.com/partner-api/technical/

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
import { MOCK_DESTINATIONS, MOCK_PRODUCTS, MOCK_TAGS } from './viator-mock';

// Force mock usage if API key is obviously invalid or for testing
const USE_MOCK = false; // Disabled as per user request

interface ViatorProduct {
    productCode: string;
    title: string;
    description?: string;
    productUrl?: string; // Full Viator URL with affiliate tracking
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
    images: string[];
    price: number;
    currency: string;
    rating: number;
    reviewCount: number;
    duration: string;
    productCode: string;
    productUrl: string; // Full Viator URL with affiliate tracking
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

// NEW: Helper to extract up to 5 high-quality images
function extractImages(images?: ViatorProduct["images"]): string[] {
    if (!images || images.length === 0) return [];

    // Take up to 5 images
    return images.slice(0, 5).map(img => {
        if (!img.variants || img.variants.length === 0) return "";
        // Prefer HD >= 1080px for gallery, fallback to largest
        const hd = img.variants.find(v => v.width && v.width >= 1080);
        if (hd) return hd.url;
        const sorted = [...img.variants].sort((a, b) => (b.width || 0) - (a.width || 0));
        return sorted[0]?.url || "";
    }).filter(url => url !== "");
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
    lat?: number;
    lng?: number;
}

export const TRENDING_DESTINATION_IDS: TrendingDestination[] = [
    { id: 479, name: "Paris", country: "France", query: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200", lat: 48.8566, lng: 2.3522 },
    { id: 828, name: "Dubai", country: "UAE", query: "Dubai", image: "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&q=80&w=1200", lat: 25.2048, lng: 55.2708 },
    { id: 711, name: "Rome", country: "Italy", query: "Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1200", lat: 41.9028, lng: 12.4964 },
    { id: 1007, name: "Vaduz", country: "Liechtenstein", query: "Vaduz", image: "https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?auto=format&fit=crop&q=80&w=1200", lat: 47.1415, lng: 9.5215 },
    { id: 562, name: "Barcelona", country: "Spain", query: "Barcelona", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=1200", lat: 41.3851, lng: 2.1734 },
    { id: 674, name: "New York", country: "USA", query: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200", lat: 40.7128, lng: -74.0060 },
    { id: 737, name: "London", country: "UK", query: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1200", lat: 51.5074, lng: -0.1278 },
    { id: 334, name: "Tokyo", country: "Japan", query: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200", lat: 35.6762, lng: 139.6503 },
    { id: 357, name: "Sydney", country: "Australia", query: "Sydney", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1200", lat: -33.8688, lng: 151.2093 },
    { id: 1004, name: "Cape Town", country: "South Africa", query: "Cape Town", image: "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&q=80&w=1200", lat: -33.9249, lng: 18.4241 },
    // { id: 1005, name: "Rio de Janeiro", country: "Brazil", query: "Rio de Janeiro", image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1200", lat: -22.9068, lng: -43.1729 },
    // { id: 1006, name: "Reykjavik", country: "Iceland", query: "Reykjavik", image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=1200", lat: 64.1466, lng: -21.9426 }
];

export async function getTrendingDestinations(locale = "en"): Promise<TrendingDestination[]> {
    // Fetch all destinations (cached) for the requested locale
    const cachedDestinations = await fetchAllDestinations(locale);

    // Map our hardcoded IDs to the localized names found in the API response
    return TRENDING_DESTINATION_IDS.map(dest => {
        const found = cachedDestinations.find(d => d.destinationId === dest.id);
        return {
            ...dest,
            name: found?.name || dest.name, // Use localized name if found, else fallback
            country: found?.type === "COUNTRY" ? found.name : dest.country // Viator destinations list doesn't easily give country for a city without lookup, but we can try.
            // Actually, fetchAllDestinations returns flat list. 
            // 'Rome' (711) name will be 'Rom' in German. 
            // We might keep the hardcoded country for now or try to resolve it if we had parent lookup.
            // For now, let's just localize the City Name which is the most important.
        };
    });
}

// Fetch all tags from Viator API
export async function fetchViatorTags(locale = "en"): Promise<ViatorTag[]> {
    // Return cached data if still valid
    if (tagsCache && Date.now() - tagsCacheTime < CACHE_DURATION) {
        return tagsCache;
    }

    if (USE_MOCK || !VIATOR_API_KEY) {
        console.warn("Using MOCK Viator Tags");
        tagsCache = MOCK_TAGS;
        tagsCacheTime = Date.now();
        return MOCK_TAGS;
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/products/tags`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": locale,
                "exp-api-key": VIATOR_API_KEY!,
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
    const tags = await fetchViatorTags(locale);

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
async function fetchAllDestinations(locale = "en"): Promise<{ destinationId: number; name: string; type: string }[]> {
    // Return cached data if still valid
    if (destinationsCache && Date.now() - destinationsCacheTime < CACHE_DURATION) {
        return destinationsCache;
    }

    if (USE_MOCK || !VIATOR_API_KEY) {
        console.warn("Using MOCK Viator Destinations");
        destinationsCache = MOCK_DESTINATIONS;
        destinationsCacheTime = Date.now();
        return MOCK_DESTINATIONS;
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/destinations`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": locale,
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

// Hardcoded mappings for continents and major countries to ensure they work
// even if not in the cached top destinations list
const HARDCODED_DESTINATION_IDS: Record<string, number> = {
    "europe": 8,
    "asia": 4,
    "africa": 2,
    "germany": 59,
    "france": 49,
    "italy": 37,
    "spain": 53,
    "usa": 684,
    "united states": 684,
    "uk": 46,
    "united kingdom": 46,
    "london": 737,
    "paris": 479,
    "rome": 711,
    "dubai": 828,
    "tokyo": 334,
    "new york": 687
};

// Helper to find destination ID for a city name by searching cached destinations
async function resolveDestinationId(query: string, locale = "en"): Promise<string | null> {
    const queryLower = query.toLowerCase().trim();

    // 0. Check hardcoded map first
    if (HARDCODED_DESTINATION_IDS[queryLower]) {
        console.log(`Resolved "${query}" via hardcoded map to ID: ${HARDCODED_DESTINATION_IDS[queryLower]}`);
        return HARDCODED_DESTINATION_IDS[queryLower].toString();
    }

    const destinations = await fetchAllDestinations(locale);

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
    endDate?: string,   // YYYY-MM-DD
    locale = "en",
    filters?: {
        priceMin?: number;
        priceMax?: number;
        tags?: number[];
        destinationId?: string;
    }
): Promise<{ activities: TransformedActivity[]; totalCount?: number; error?: string; resolvedDestinationId?: string }> {
    if (!USE_MOCK && !VIATOR_API_KEY) {
        return { activities: [], error: "Viator API key not configured" };
    }

    if (USE_MOCK) {
        console.warn(`Using MOCK Search for: ${query}`);
        // Simple mock search filtering
        const results = MOCK_PRODUCTS.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.destinations?.some(d => d.name?.toLowerCase().includes(query.toLowerCase()))
        );

        const activities: TransformedActivity[] = results.map((product) => ({
            id: product.productCode,
            title: product.title,
            location: product.destinations?.[0]?.name || "",
            image: selectBestImage(product.images as any),
            images: extractImages(product.images as any), // POPULATE MOCK
            price: product.pricing?.summary?.fromPrice || 0,
            currency: product.pricing?.currency || "EUR",
            rating: product.reviews?.combinedAverageRating || 0,
            reviewCount: product.reviews?.totalReviews || 0,
            duration: formatDuration(product.duration),
            productCode: product.productCode,
            productUrl: product.productUrl || "",
        }));

        return { activities, totalCount: activities.length };
    }

    try {
        // 1. Resolve Destination ID mainly because /products/search REQUIRES a destination filter
        // We try to find a destination matching the query string.
        let destinationId = filters?.destinationId || await resolveDestinationId(query, locale);

        if (!destinationId) {
            // FALLBACK: If query is generic (like "activities", "culture"), use a showcase destination (e.g. Europe: 8 or London: 737)
            // This ensures we show REAL data instead of failing or showing mock data.
            const lowerQ = query.toLowerCase();
            if (lowerQ.includes('activit') || lowerQ.includes('culture') || lowerQ.includes('tour') || lowerQ === 'popular') {
                console.log(`Using showcase destination (Europe/London) for generic query: ${query}`);
                destinationId = "8"; // Try Europe first
            } else {
                console.warn(`Could not resolve destination for query: ${query}.`);
                return { activities: [], error: `Could not resolve destination: ${query}` };
            }
        }

        // 2. Search products with the found Destination ID
        const response = await fetch(`${VIATOR_API_BASE}/products/search`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": locale,
                "exp-api-key": VIATOR_API_KEY!,
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
                    ...(filters?.priceMin !== undefined && { lowestPrice: filters.priceMin }),
                    ...(filters?.priceMax !== undefined && { highestPrice: filters.priceMax }),
                    ...(filters?.tags && filters.tags.length > 0 && { tags: filters.tags }),
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

        // Batch resolve destinations BEFORE mapping
        const { batchResolveDestinations } = await import('@/lib/api/destination-resolver');
        const locationMap = await batchResolveDestinations(data.products);

        // Transform Viator products to our Activity format
        const activities: TransformedActivity[] = data.products.map((product) => ({
            id: product.productCode,
            title: product.title,
            location: locationMap.get(product.productCode) || "",
            image: selectBestImage(product.images),
            images: extractImages(product.images), // POPULATE REAL
            price: product.pricing?.summary?.fromPrice || 0,
            currency: product.pricing?.currency || "EUR",
            rating: product.reviews?.combinedAverageRating || 0,
            reviewCount: product.reviews?.totalReviews || 0,
            duration: formatDuration(product.duration),
            productCode: product.productCode,
            productUrl: product.productUrl || "", // Viator API returns complete affiliate URL
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

        return { activities, totalCount: data.totalCount, resolvedDestinationId: destinationId };
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { activities: [], totalCount: 0, error: "Failed to fetch from Viator API" };
    }
}

export async function getViatorProductDetails(productCode: string, locale = "en") {
    if (!USE_MOCK && !VIATOR_API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        if (USE_MOCK) {
            console.warn("Using MOCK product details");
            const mock = MOCK_PRODUCTS.find(p => p.productCode === productCode);
            if (mock) {
                // Ensure the mock has the structure the UI expects
                return {
                    ...mock,
                    // Add any missing details required for full page
                    inclusions: ["Entry Ticket", "Digital Guide"],
                    exclusions: ["Food", "Hotel Pickup"],
                    logistics: { start: [{ name: "Meeting Point A" }] }
                };
            }
            // If not found in mock list, return a generic one or error
            return { error: "Product not found in mock data" };
        }

        // Use BULK endpoint even for single product to ensure consistent data (pricing, etc.)
        const response = await fetch(`${VIATOR_API_BASE}/products/bulk`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": locale,
                "Content-Type": "application/json",
                "exp-api-key": VIATOR_API_KEY!,
            },
            body: JSON.stringify({
                productCodes: [productCode],
                currency: "EUR"
            }),
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`Viator Bulk API Error: ${response.status} for ${productCode}`);
            return { error: `API Error: ${response.status}` };
        }

        const data = await response.json();
        // Viator Bulk API returns ARRAY directly: [{...}] not {products: [...]}
        const product = Array.isArray(data) ? data[0] : data.products?.[0];
        if (!product) {
            console.error(`Viator Product not found in bulk response for ${productCode}`);
            return { error: "Product not found" };
        }
        return product;
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch product details" };
    }
}

// Pax Mix Interface
export interface PaxMixItem {
    ageBand: string;
    numberOfTravelers: number;
}

export async function getViatorAvailability(
    productCode: string,
    travelDate: string, // Format: YYYY-MM-DD
    paxMix?: PaxMixItem[],
    productOptionCode?: string
) {
    // Read env dynamically to allow testing
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        if (USE_MOCK) {
            console.warn("Using MOCK availability");
            return {
                bookableItems: [
                    {
                        productOptionCode: "DEFAULT",
                        price: {
                            totalPrice: {
                                price: {
                                    value: 25.00,
                                    currency: "EUR"
                                }
                            }
                        },
                        available: true
                    }
                ]
            };
        }

        const body: Record<string, unknown> = {
            productCode,
            travelDate,
            currency: "EUR",
        };

        if (paxMix && paxMix.length > 0) {
            body.paxMix = paxMix;
        }

        if (productOptionCode) {
            body.productOptionCode = productOptionCode;
        }

        const response = await fetch(`${VIATOR_API_BASE}/availability/check`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
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

export async function getViatorProductReviews(productCode: string, count: number = 5, start: number = 1) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { reviews: [] };
    }

    try {
        if (USE_MOCK) {
            return {
                reviews: [
                    {
                        reviewReference: "mock-1",
                        text: "Amazing experience! The guide was fantastic.",
                        rating: 5,
                        userName: "Mock User 1",
                        publishedDate: "2024-01-01",
                        title: "Great Tour"
                    }
                ]
            };
        }

        const response = await fetch(`${VIATOR_API_BASE}/reviews/product`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productCode,
                count,
                start,
                sortOrder: "MOST_RECENT_PER_LANGUAGE",
                provider: "ALL"
            }),
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            console.warn(`Failed to fetch reviews: ${response.status}`);
            return { reviews: [] };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator Reviews fetch error:", error);
        return { reviews: [] };
    }
}

// Get availability schedules for multiple products (Bulk)
export async function getViatorAvailabilitySchedulesBulk(productCodes: string[]) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/availability/schedules/bulk`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productCodes }),
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch availability schedules" };
    }
}

// Get cancellation reasons
export async function getViatorCancellationReasons(locale = "en") {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/bookings/cancel-reasons`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": locale,
                "exp-api-key": API_KEY!,
            },
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch cancellation reasons" };
    }
}

// Booking Interfaces
export interface BookerInfo {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface BookingRequest {
    cartRef: string;
    booker: BookerInfo;
    paymentToken?: string;
    currency?: string;
    partnerBookingRef?: string;
    items?: BookingItem[];
}

// Create a booking
export async function createViatorBooking(request: BookingRequest) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/bookings/cart/book`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Booking failed:", response.status, errorText);
            return { error: `API Error: ${response.status}`, details: errorText };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to create booking" };
    }
}

// Cart Hold Interfaces
export interface BookingItem {
    productCode: string;
    productOptionCode?: string;
    travelDate: string;
    startTime?: string;
    paxMix: PaxMixItem[];
}

export interface CartHoldRequest {
    items: BookingItem[];
    currency?: string;
}

// Create a cart hold
export async function createViatorCartHold(request: CartHoldRequest) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/bookings/cart/hold`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Cart Hold failed:", response.status, errorText);
            return { error: `API Error: ${response.status}`, details: errorText };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to create cart hold" };
    }
}

// Get bookings modified since
export async function getBookingsModifiedSince(modifiedSince: string) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/bookings/modified-since?modified-since=${modifiedSince}`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
            },
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch modified bookings" };
    }
}

// Get booking status
export async function getBookingStatus(filter = {}) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/bookings/status`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(filter),
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch booking status" };
    }
}

// Get cancellation quote
export async function cancelBookingQuote(bookingRef: string) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/bookings/${bookingRef}/cancel-quote`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
            },
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch cancel quote" };
    }
}

// Cancel booking
export async function cancelBooking(bookingRef: string, reasonCode?: string) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const body: Record<string, unknown> = {};
        if (reasonCode) body.reasonCode = reasonCode;

        const response = await fetch(`${VIATOR_API_BASE}/bookings/${bookingRef}/cancel`, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to cancel booking" };
    }
}

// Get product reviews
export async function getProductReviews(productCode: string, locale = "en", count = 5) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(
            `${VIATOR_API_BASE}/reviews/product`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json;version=2.0",
                    "Accept-Language": locale,
                    "Content-Type": "application/json",
                    "exp-api-key": API_KEY!,
                },
                body: JSON.stringify({
                    productCode: productCode,
                    provider: "VIATOR",
                    count: count,
                    start: 0,
                    ratings: [1, 2, 3, 4, 5]
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Reviews API Error: ${response.status} - ${errorText}`);
            return { error: `API Error: ${response.status}`, reviews: [] };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch reviews", reviews: [] };
    }
}


// Get booking voucher/ticket
export async function getBookingVoucher(bookingRef: string, locale = "en") {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(
            `${VIATOR_API_BASE}/bookings/${bookingRef}/voucher`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json;version=2.0",
                    "Accept-Language": locale,
                    "exp-api-key": API_KEY!,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Voucher fetch failed: ${response.status} - ${errorText}`);
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch voucher" };
    }
}

// Get product booking questions
export async function getProductBookingQuestions(productCode: string, locale = "en") {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(
            `${VIATOR_API_BASE}/products/booking-questions?productCodes=${productCode}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json;version=2.0",
                    "Accept-Language": locale,
                    "exp-api-key": API_KEY!,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Booking questions fetch failed: ${response.status} - ${errorText}`);
            return { error: `API Error: ${response.status}`, bookingQuestions: [] };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch booking questions", bookingQuestions: [] };
    }
}

// Acknowledge modified bookings (required within 5 minutes of fetching)
export async function acknowledgeModifiedBookings(bookingRefs: string[]) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(
            `${VIATOR_API_BASE}/bookings/modified-since/acknowledge`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json;version=2.0",
                    "Accept-Language": "en",
                    "Content-Type": "application/json",
                    "exp-api-key": API_KEY!,
                },
                body: JSON.stringify({ bookingRefs }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Acknowledge failed: ${response.status} - ${errorText}`);
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to acknowledge bookings" };
    }
}

// Fetch locations details (Bulk)
export async function fetchLocationsBulk(locationRefs: string[]) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(
            `${VIATOR_API_BASE}/locations/bulk`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json;version=2.0',
                    'Accept-Language': 'en',
                    'Content-Type': 'application/json',
                    'exp-api-key': API_KEY!,
                },
                body: JSON.stringify({ locations: locationRefs.map(ref => ({ ref })) }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Locations fetch failed: ${response.status} - ${errorText}`);
            return { error: `API Error: ${response.status}`, locations: [] };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch locations", locations: [] };
    }
}

// Search attractions
export async function searchAttractions(destinationId: number, start = 1, count = 20) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/attractions/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'Content-Type': 'application/json',
                'exp-api-key': API_KEY!,
            },
            body: JSON.stringify({
                destId: destinationId,
                pagination: { start, count }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Attractions search failed: ${response.status} - ${errorText}`);
            return { error: `API Error: ${response.status}`, attractions: [] };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to search attractions", attractions: [] };
    }
}

// Exchange Rates
export interface ViatorExchangeRate {
    sourceCurrency: string;
    targetCurrency: string;
    rate: number;
    validFrom?: string;
    validUntil?: string;
}

export interface ViatorExchangeRatesResponse {
    rates?: ViatorExchangeRate[];
    exchangeRates?: ViatorExchangeRate[];
    error?: string;
}

/**
 * Fetch exchange rates from Viator API.
 * Returns rates relative to EUR (or specified source currency).
 */
export async function fetchViatorExchangeRates(sourceCurrency = 'EUR'): Promise<ViatorExchangeRatesResponse> {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/exchange-rates`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Content-Type': 'application/json',
                'exp-api-key': API_KEY,
            },
            body: JSON.stringify({ sourceCurrency }),
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Exchange rates fetch failed: ${response.status} - ${errorText}`);
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator Exchange Rates API error:", error);
        return { error: "Failed to fetch exchange rates" };
    }
}

// Get availability schedule for a single product to find open dates efficiently
export async function getViatorProductSchedule(productCode: string) {
    const API_KEY = process.env.VIATOR_API_KEY || VIATOR_API_KEY;

    if (!USE_MOCK && !API_KEY) {
        return { error: "Viator API key not configured" };
    }

    try {
        const response = await fetch(`${VIATOR_API_BASE}/availability/schedules/${productCode}`, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": API_KEY!,
            },
            next: { revalidate: 3600 } // Cache schedule for 1 hour
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Viator API fetch error:", error);
        return { error: "Failed to fetch product schedule" };
    }
}

