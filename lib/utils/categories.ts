
/**
 * Shared category metadata for TripVega
 */

export interface CategoryMapping {
    id: string;          // Slug/ID used in URL
    viatorTagId: number; // Viator API Tag ID
    label: string;
    icon: string;
    keywords: string[];
}

export const CATEGORY_MAPPING: CategoryMapping[] = [
    {
        id: "food",
        viatorTagId: 21911,
        label: "Food & Drink",
        icon: "restaurant",
        keywords: ["food", "culinary", "wine", "beer", "cooking", "gastronomy", "tasting", "dinner", "lunch", "brunch", "restaurant"]
    },
    {
        id: "sport",
        viatorTagId: 21909,
        label: "Sport & Outdoor",
        icon: "sports_soccer",
        keywords: ["sport", "hiking", "biking", "cycling", "climbing", "kayak", "surf", "ski", "golf", "adventure", "outdoor"]
    },
    {
        id: "culture",
        viatorTagId: 21910,
        label: "Art & Culture",
        icon: "museum",
        keywords: ["museum", "art", "gallery", "history", "heritage", "architecture", "culture", "monument", "theater", "theatre", "church", "cathedral", "palace"]
    },
    {
        id: "nature",
        viatorTagId: 21909, // Nature often overlaps with Outdoor in Viator
        label: "Nature",
        icon: "park",
        keywords: ["nature", "park", "garden", "wildlife", "safari", "forest", "mountain", "lake", "beach", "waterfall", "eco"]
    },
    {
        id: "tours",
        viatorTagId: 21913,
        label: "City Tours",
        icon: "location_city",
        keywords: ["city tour", "walking tour", "sightseeing", "hop-on", "bus tour", "guided tour"]
    },
    {
        id: "water",
        viatorTagId: 21913, // Cruises & Water tours
        label: "Water Activities",
        icon: "sailing",
        keywords: ["boat", "cruise", "sailing", "snorkel", "diving", "swim", "water", "river", "canal", "yacht", "kayak", "paddle"]
    },
    {
        id: "transport",
        viatorTagId: 21914,
        label: "Transport",
        icon: "directions_bus",
        keywords: ["transport", "transfer", "airport", "shuttle", "driver", "taxi", "pickup", "bus", "train", "limousine"]
    },
];

export function getViatorTagId(categoryId: string): number | undefined {
    return CATEGORY_MAPPING.find(c => c.id === categoryId)?.viatorTagId;
}

export function getCategoryById(id: string): CategoryMapping | undefined {
    return CATEGORY_MAPPING.find(c => c.id === id);
}
