'use server';

import OpenAI from 'openai';
import { searchViatorProducts, getViatorAvailability } from '@/lib/api/viator-client';

// Initialize OpenAI client with DeepSeek configuration
const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export interface TripPlanRequest {
    query: string; // e.g., "Paris für 3 Tage als Paar"
    preferences?: {
        travelers: 'solo' | 'couple' | 'family_kids' | 'family_teens' | 'friends';
        vibe: string[];
        budget: 'saver' | 'balanced' | 'luxury';
        pacing: 'relaxed' | 'balanced' | 'fast';
        mobility: 'active' | 'accessible';
        startDate?: string; // YYYY-MM-DD
        guestCount?: number;
    };
}

export interface TripActivity {
    day: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    activityId: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    productUrl: string;
    productCode: string; // For regeneration and tracking
    location?: string;
}

export interface TripPlanResponse {
    destination: string;
    destinationId?: string;
    summary: string;
    itinerary: TripActivity[];
    segments?: Record<string, any>;
    startDate?: string | null;
    travelerCount?: number | null;
    error?: string;
}

export async function generateTripPlanAction(query: string, preferences?: TripPlanRequest['preferences']): Promise<TripPlanResponse> {
    if (!process.env.DEEPSEEK_API_KEY) {
        return { destination: '', summary: '', itinerary: [], error: 'AI Service not configured' };
    }

    try {
        // 1. Analyze the Request with AI to extract separate search terms & intents
        const systemPrompt = `You are an expert travel assistant. Analyze the user's trip request and preferences.
        User Query: "${query}"
        Preferences: ${preferences ? JSON.stringify(preferences) : "None provided"}

        Rules:
        1. **Language**: The user speaks German. Ensure planning is appropriate for a German-speaking user.
        2. "Intent Beats Budget": If user asks for high-value items (Helicopter, Yacht, Private Plane, Hot Air Balloon), set "highValueIntent" to true, regardless of budget setting.
        3. Budget Mapping (if no high value intent):
           - "saver": Max price ~50 EUR
           - "balanced": Max price ~150 EUR
           - "luxury": No limit
        
        Extract:
        1. Destination (city name only)
        2. Duration (days, default to 3 if unknown)
        3. Traveler type (couple, family, solo, friends)
        4. highValueIntent (boolean)
        5. budgetConstraint (number or null)
        6. searchTerms (Array of 3-5 distinct, viator-friendly search strings. E.g. "Eiffel Tower Skip Line", "Louvre Museum", "Seine Cruise Dinner")
        7. pacingInstruction (string: "relaxed" -> "Cluster activities by location, max 2 per day, MINIMUM 2 HOURS GAP", "fast" -> "Efficient routing, 4+ activities, MINIMUM 1 HOUR GAP")
        8. startDate (YYYY-MM-DD, optional, derived if not expressly provided)
        9. travelerCount (number, optional, derived if not expressly provided)

        Return JSON only: { 
            "destination": string, 
            "duration": number, 
            "type": string, 
            "highValueIntent": boolean, 
            "budgetConstraint": number | null, 
            "budgetConstraint": number | null, 
            "searchTerms": string[],
            "pacingInstruction": string,
            "startDate": string | null, // YYYY-MM-DD
            "travelerCount": number | null
        }`;

        const analysisCompletion = await deepseek.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
            ],
            model: "deepseek-chat",
            response_format: { type: "json_object" }
        });

        const analysisContent = analysisCompletion.choices[0].message.content;
        if (!analysisContent) throw new Error("Failed to analyze request");

        const analysis = JSON.parse(analysisContent);
        const { destination, searchTerms, highValueIntent, budgetConstraint } = analysis;

        // 2. Fetch Real Activities from Viator for each search term
        // Logic: "Soft Filter"
        // If highValueIntent is true, ignore budgetConstraint.
        // If budgetConstraint is set, try to fetch with filter. If < 2 results, retry without filter.

        const searchPromises = searchTerms.map(async (term: string) => {
            // Determine strictness
            let useBudget = !highValueIntent && budgetConstraint !== null;

            // First attempt: Strict
            let result = await searchViatorProducts(
                `${destination} ${term}`,
                15,
                analysis.startDate || undefined, // Pass startDate to Viator search
                undefined,
                'de', // Ensure results are in German/suitable for German locale
                {
                    priceMax: useBudget ? budgetConstraint : undefined
                }
            );

            // Soft Fail / Retry Logic
            if (useBudget && (!result.activities || result.activities.length < 2)) {
                console.log(`Soft Fail for "${term}" with budget ${budgetConstraint}. Retrying without limit.`);
                // Retry without price limit
                const retryResult = await searchViatorProducts(`${destination} ${term}`, 15);

                // Mark these as "over budget" internally if we needed to? 
                // For now, just return them. The AI will decide if they are worth it.
                return retryResult;
            }

            return result;
        });

        const searchResults = await Promise.all(searchPromises);
        const resolvedDestId = searchResults.find(r => r.resolvedDestinationId)?.resolvedDestinationId;

        // Flatten and deduplicate results
        const allActivities = new Map();
        searchResults.forEach(result => {
            if (result.activities) {
                result.activities.forEach((act: any) => {
                    allActivities.set(act.id, act);
                });
            }
        });

        if (allActivities.size === 0) {
            // Fallback: Just search destination
            const fallback = await searchViatorProducts(destination, 20, analysis.startDate || undefined);
            if (fallback.activities) {
                fallback.activities.forEach(act => allActivities.set(act.id, act));
            }
        }

        let availableActivities = Array.from(allActivities.values());

        // Profit Optimization / Sorting (Client-side logic simulation)
        // If highValueIntent provided, ensure expensive items are available
        if (highValueIntent) {
            // Sort by price descending to highlight luxury options
            availableActivities.sort((a, b) => b.price - a.price);
        }

        // Simplify activities for token limit
        const simplifiedActivities = availableActivities.map(a => ({
            id: a.id,
            title: a.title,
            price: a.price,
            rating: a.rating,
            location: a.location
        })).slice(0, 50); // increased limit to ensure variety

        // 3. Generate Itinerary using AI with the REAL activities
        const itineraryCompletion = await deepseek.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Create a ${analysis.duration}-day travel itinerary for a ${analysis.type} in ${destination}.
            
            Pacing Guide: ${analysis.pacingInstruction}
            
            Instructions:
            1. Select the BEST activities from the provided list.
            2. ${preferences?.pacing === 'relaxed' ? "CRITICAL: Group activities by proximity. Allow 4 hours per activity + travel time. RESTRICT to max 2 major activities per day." : "Optimize for seeing as much as possible, but ensure at least 60-90mins GAP between activities for travel."}
            3. If user has 'highValueIntent', prioritize the Premium/Luxury options.
            4. **CRITICAL: NEVER use the same activityId more than once in the entire itinerary. Duplicates are strictly forbidden.**
            5. **TIMING: Assign realistic start times. IMPERATIVE: Account for travel time between locations.**
               - Relaxed: 2-3 activities/day. Start at 10:00. 30-45 min travel buffers.
               - Fast: 4-5 activities/day. Start at 08:30. 15-30 min travel buffers.
               - Balanced: 3 activities/day. Start at 09:30.
            6. **LANGUAGE: The 'summary' and 'reason' fields MUST be written in GERMAN.**
            7. Format output as JSON:
            {
               "summary": "Inspiriere Zusammenfassung der Reise (auf Deutsch)",
               "itinerary": [
                  {
                    "day": number,
                    "timeOfDay": "morning" | "afternoon" | "evening",
                    "activityId": "ID from provided list",
                    "reason": "Warum das passt (auf Deutsch mentions vibe/pacing)"
                  }
               ]
            }`
                },
                {
                    role: "user",
                    content: `Activities available: ${JSON.stringify(simplifiedActivities)}`
                }
            ],
            model: "deepseek-chat",
            response_format: { type: "json_object" }
        });

        const itineraryContent = itineraryCompletion.choices[0].message.content;
        if (!itineraryContent) throw new Error("Failed to generate itinerary");

        const itineraryPlan = JSON.parse(itineraryContent);

        // 4. Re-hydrate the itinerary with full activity details
        const fullItinerary = itineraryPlan.itinerary.map((item: any) => {
            const originalAct = allActivities.get(item.activityId);
            if (!originalAct) return null;

            // Use the productUrl directly from Viator API - it includes proper affiliate tracking
            // The API returns URLs like: https://www.viator.com/de-DE/tours/Paris/Tour-Name/d479-PRODUCTCODE?mcid=...&pid=...&medium=api
            const productCode = originalAct.id;

            return {
                day: item.day,
                timeOfDay: item.timeOfDay,
                activityId: item.activityId,
                title: originalAct.title,
                description: item.reason || originalAct.title,
                price: originalAct.price,
                currency: originalAct.currency,
                image: originalAct.image,
                productUrl: originalAct.productUrl || `/activities/${productCode}`, // Use API URL or fallback
                productCode: productCode, // Keep for internal reference
                location: originalAct.location
            };
        }).filter(Boolean);

        return {
            destination: destination,
            destinationId: resolvedDestId,
            summary: itineraryPlan.summary,
            itinerary: fullItinerary,
            startDate: preferences?.startDate || analysis.startDate || null,
            travelerCount: preferences?.guestCount || analysis.travelerCount || null
        };

    } catch (error) {
        console.error("AI Planner Error:", error);
        return { destination: '', summary: '', itinerary: [], error: 'Failed to generate plan.' };
    }
}

/**
 * Replaces a single activity in the itinerary with an alternative.
 * Searches for similar activities in the same destination, excluding the rejected one.
 */
export async function replaceActivityAction(
    destination: string,
    excludeProductCode: string,
    day: number,
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    existingProductCodes: string[] // All product codes in the current plan to avoid duplicates
): Promise<TripActivity | null> {
    try {
        // Search for alternatives in the same destination
        const searchResult = await searchViatorProducts(destination, 10, undefined, undefined, 'de');

        if (!searchResult.activities || searchResult.activities.length === 0) {
            console.error("No alternatives found for", destination);
            return null;
        }

        // Filter out the excluded activity and any already in the plan
        const allExcluded = new Set([excludeProductCode, ...existingProductCodes]);
        const alternatives = searchResult.activities.filter(
            act => !allExcluded.has(act.id)
        );

        if (alternatives.length === 0) {
            console.error("No unique alternatives available");
            return null;
        }

        // Pick the best alternative (already sorted by rating)
        const chosen = alternatives[0];

        // Use the productUrl directly from Viator API - it includes proper affiliate tracking
        return {
            day,
            timeOfDay,
            activityId: chosen.id,
            title: chosen.title,
            description: `Alternative activity in ${chosen.location}`,
            price: chosen.price,
            currency: chosen.currency,
            image: chosen.image,
            productUrl: chosen.productUrl || `/activities/${chosen.id}`, // Use API URL or fallback
            productCode: chosen.id,
            location: chosen.location
        };
    } catch (error) {
        console.error("Replace activity error:", error);
        return null;
    }
}


/**
 * Searches for restaurant/food experiences in a destination.
 * Used by SegmentCard to show food options between activities.
 */
export interface RestaurantResult {
    id: string;
    title: string;
    image: string;
    price: number;
    currency: string;
    productUrl: string;
    rating?: number;
}

export async function searchRestaurantsAction(
    destination: string,
    limit: number = 5,
    destinationId?: string
): Promise<RestaurantResult[]> {
    try {
        // Search specifically for lunch and dinner experiences to get closer to "restaurants"
        const searchResult = await searchViatorProducts(
            `${destination} lunch dinner restaurant gourmet tasting`,
            limit,
            undefined,
            undefined,
            'de',
            { destinationId } // Pass the exact ID to avoid location mismatches
        );

        if (!searchResult.activities || searchResult.activities.length === 0) {
            // Fallback to more general food terms
            const fallbackResult = await searchViatorProducts(
                `${destination} culinary food experience`,
                limit,
                undefined,
                undefined,
                'de'
            );

            if (!fallbackResult.activities) return [];

            return fallbackResult.activities.map(act => ({
                id: act.id,
                title: act.title,
                image: act.image,
                price: act.price,
                currency: act.currency,
                productUrl: act.productUrl || `/activities/${act.id}`,
                rating: act.rating
            }));
        }

        return searchResult.activities.map(act => ({
            id: act.id,
            title: act.title,
            image: act.image,
            price: act.price,
            currency: act.currency,
            productUrl: act.productUrl || `/activities/${act.id}`,
            rating: act.rating
        }));
    } catch (error) {
        console.error("Search restaurants error:", error);
        return [];
    }
}
