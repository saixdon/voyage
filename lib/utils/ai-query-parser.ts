/**
 * AI Query Parser
 * 
 * Parses natural language search queries into structured filters.
 * This runs on the client side to extract intent from user input.
 * 
 * Examples:
 * - "unter 50€" → priceMax: 50
 * - "Familienfreundlich" → tags: [family-friendly related]
 * - "am Morgen" → timeOfDay: morning
 */

export interface ParsedQuery {
    // The cleaned search text (city/activity name)
    searchTerm: string;

    // Price filters
    priceMin?: number;
    priceMax?: number;

    // Duration filters (in hours)
    durationMin?: number;
    durationMax?: number;

    // Time of day preference
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';

    // Category/tag hints
    categoryHints?: string[];

    // Original query for debugging
    originalQuery: string;
}

// Price patterns for different languages
const PRICE_PATTERNS = {
    maxPrice: [
        /unter\s*(\d+)\s*€/i,           // unter 50€
        /bis\s*(\d+)\s*€/i,             // bis 50€
        /maximal\s*(\d+)\s*€/i,         // maximal 50€
        /max\.?\s*(\d+)\s*€/i,          // max 50€
        /under\s*(\d+)\s*€/i,           // under 50€
        /below\s*(\d+)\s*€/i,           // below 50€
        /less than\s*(\d+)\s*€/i,       // less than 50€
        /moins de\s*(\d+)\s*€/i,        // moins de 50€ (French)
    ],
    minPrice: [
        /ab\s*(\d+)\s*€/i,              // ab 50€
        /über\s*(\d+)\s*€/i,            // über 50€
        /mindestens\s*(\d+)\s*€/i,      // mindestens 50€
        /from\s*(\d+)\s*€/i,            // from 50€
        /above\s*(\d+)\s*€/i,           // above 50€
    ],
    priceRange: [
        /(\d+)\s*[-–bis]\s*(\d+)\s*€/i, // 50-100€ or 50 bis 100€
    ]
};

// Duration patterns
const DURATION_PATTERNS = {
    short: [
        /kurze?/i, /schnell/i, /1-2 stunden?/i, /short/i, /quick/i
    ],
    halfDay: [
        /halbtags/i, /halber tag/i, /half day/i, /3-4 stunden?/i
    ],
    fullDay: [
        /ganztags/i, /ganzer tag/i, /full day/i, /ganz[eö]?n? tag/i
    ]
};

// Time of day patterns
const TIME_PATTERNS = {
    morning: [
        /morgen[s]?/i, /früh/i, /vormittag/i, /morning/i, /early/i, /am morgen/i
    ],
    afternoon: [
        /nachmittag/i, /afternoon/i, /mittag/i
    ],
    evening: [
        /abend/i, /evening/i, /sonnenuntergang/i, /sunset/i
    ],
    night: [
        /nacht/i, /night/i, /nächtlich/i
    ]
};

// Category keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    family: [
        'familie', 'familienfreundlich', 'kinder', 'kids', 'family', 'child-friendly',
        'für kinder', 'mit kindern', 'für familien'
    ],
    romantic: [
        'romantisch', 'romantic', 'pärchen', 'couple', 'honeymoon', 'zu zweit',
        'date', 'dinner'
    ],
    adventure: [
        'abenteuer', 'adventure', 'adrenalin', 'extrem', 'action', 'thrill'
    ],
    culture: [
        'kultur', 'museum', 'geschichte', 'history', 'kunst', 'art', 'heritage',
        'kulturell', 'cultural'
    ],
    food: [
        'essen', 'food', 'kulinarisch', 'culinary', 'kochen', 'cooking',
        'wein', 'wine', 'gastro'
    ],
    nature: [
        'natur', 'nature', 'outdoor', 'wandern', 'hiking', 'park', 'wildlife'
    ]
};

/**
 * Parse a natural language query into structured filters
 */
export function parseSearchQuery(query: string): ParsedQuery {
    const result: ParsedQuery = {
        searchTerm: query,
        originalQuery: query,
        categoryHints: []
    };

    let workingQuery = query;

    // 1. Extract price filters
    for (const pattern of PRICE_PATTERNS.maxPrice) {
        const match = workingQuery.match(pattern);
        if (match) {
            result.priceMax = parseInt(match[1], 10);
            workingQuery = workingQuery.replace(pattern, '').trim();
            break;
        }
    }

    for (const pattern of PRICE_PATTERNS.minPrice) {
        const match = workingQuery.match(pattern);
        if (match) {
            result.priceMin = parseInt(match[1], 10);
            workingQuery = workingQuery.replace(pattern, '').trim();
            break;
        }
    }

    for (const pattern of PRICE_PATTERNS.priceRange) {
        const match = workingQuery.match(pattern);
        if (match) {
            result.priceMin = parseInt(match[1], 10);
            result.priceMax = parseInt(match[2], 10);
            workingQuery = workingQuery.replace(pattern, '').trim();
            break;
        }
    }

    // 2. Extract time of day
    for (const [timeKey, patterns] of Object.entries(TIME_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(workingQuery)) {
                result.timeOfDay = timeKey as ParsedQuery['timeOfDay'];
                workingQuery = workingQuery.replace(pattern, '').trim();
                break;
            }
        }
        if (result.timeOfDay) break;
    }

    // 3. Extract duration hints
    for (const pattern of DURATION_PATTERNS.short) {
        if (pattern.test(workingQuery)) {
            result.durationMax = 2;
            workingQuery = workingQuery.replace(pattern, '').trim();
            break;
        }
    }
    for (const pattern of DURATION_PATTERNS.halfDay) {
        if (pattern.test(workingQuery)) {
            result.durationMin = 3;
            result.durationMax = 5;
            workingQuery = workingQuery.replace(pattern, '').trim();
            break;
        }
    }
    for (const pattern of DURATION_PATTERNS.fullDay) {
        if (pattern.test(workingQuery)) {
            result.durationMin = 6;
            workingQuery = workingQuery.replace(pattern, '').trim();
            break;
        }
    }

    // 4. Extract category hints
    const lowerQuery = workingQuery.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerQuery.includes(keyword.toLowerCase())) {
                result.categoryHints!.push(category);
                // Don't remove category keywords from search - they're useful for text search too
                break;
            }
        }
    }

    // 5. Clean up the remaining search term
    result.searchTerm = workingQuery
        .replace(/\s+/g, ' ')  // Multiple spaces to single
        .trim();

    return result;
}

/**
 * Build URL params from parsed query
 */
export function buildSearchParams(parsed: ParsedQuery): URLSearchParams {
    const params = new URLSearchParams();

    if (parsed.searchTerm) {
        params.set('q', parsed.searchTerm);
    }
    if (parsed.priceMin !== undefined) {
        params.set('priceMin', String(parsed.priceMin));
    }
    if (parsed.priceMax !== undefined) {
        params.set('priceMax', String(parsed.priceMax));
    }
    if (parsed.durationMin !== undefined) {
        params.set('durationMin', String(parsed.durationMin));
    }
    if (parsed.durationMax !== undefined) {
        params.set('durationMax', String(parsed.durationMax));
    }
    if (parsed.categoryHints && parsed.categoryHints.length > 0) {
        params.set('categories', parsed.categoryHints.join(','));
    }

    return params;
}
