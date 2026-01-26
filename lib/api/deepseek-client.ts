
/**
 * DeepSeek API Client for intelligent search parsing
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export interface AIParsedQuery {
    searchTerm: string;
    priceMax?: number;
    priceMin?: number;
    durationMax?: number;
    durationMin?: number;
    categories?: string[];
    location?: string;
    tags?: string[];        // Specific semantic tags (e.g., 'family-friendly', 'entry-ticket')
    vibes?: string[];       // Mood/Atmosphere (e.g., 'romantic', 'adventurous', 'budget')
    travelerPersona?: string; // Solo, Couple, Family, Group
    intent?: string;        // Brief explanation of the detected logic
}

export async function parseQueryWithDeepSeek(query: string, locale: string = "de"): Promise<AIParsedQuery> {
    if (!DEEPSEEK_API_KEY) {
        console.warn("DEEPSEEK_API_KEY is not set. Falling back to regex parser.");
        return { searchTerm: query };
    }

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `You are a professional travel search architect. Parse the user's query into a structured 'Search Logic' JSON object.
                        
                        Fields:
                        - searchTerm: Main keywords (excluding filters/locations).
                        - location: Only the City or Country.
                        - priceMax/priceMin: In Euros.
                        - durationMax/durationMin: In hours.
                        - categories: Standard categories (food, sport, culture, nature, adventure, water, transport).
                        - tags: Specific functional tags (e.g., 'skip-the-line', 'private-tour', 'walking-tour', 'kids-menu').
                        - vibes: Atmospheric tags (e.g., 'romantic', 'luxury', 'budget', 'educational', 'fast-paced').
                        - travelerPersona: 'solo', 'couple', 'family', or 'group'.
                        - intent: A short German sentence explaining the detected logic (e.g., "Günstiges Familienessen in London").
                        
                        Language context: ${locale}.
                        Respond ONLY with valid JSON.`
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content) as AIParsedQuery;
    } catch (error) {
        console.error("DeepSeek Parsing Error:", error);
        return { searchTerm: query };
    }
}
