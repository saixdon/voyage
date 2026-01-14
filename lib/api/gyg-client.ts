// GetYourGuide Partner API Client
// Used to fetch activities from GYG for display on our platform

const GYG_API_BASE = process.env.GYG_API_BASE_URL || "https://api.getyourguide.com/1";
const GYG_USERNAME = process.env.GYG_INTEGRATOR_USERNAME;
const GYG_PASSWORD = process.env.GYG_INTEGRATOR_PASSWORD;

function getAuthHeader(): string {
    const credentials = Buffer.from(`${GYG_USERNAME}:${GYG_PASSWORD}`).toString("base64");
    return `Basic ${credentials}`;
}

export interface GygActivity {
    activity_id: number;
    title: string;
    abstract?: string;
    location?: {
        city?: string;
        country?: string;
    };
    pictures?: { url: string }[];
    price?: {
        values?: {
            amount?: number;
            currency?: string;
        };
    };
    rating?: number;
    reviews_count?: number;
    duration?: string;
    categories?: { name: string }[];
}

export interface GygSearchResponse {
    data?: {
        activities?: GygActivity[];
    };
    error?: string;
}

export async function searchActivities(query: string, limit = 20): Promise<GygSearchResponse> {
    try {
        const url = new URL(`${GYG_API_BASE}/activities`);
        url.searchParams.set("q", query);
        url.searchParams.set("limit", limit.toString());

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": getAuthHeader(),
                "Accept": "application/json",
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("GYG API Error:", response.status, errorText);
            return { error: `API Error: ${response.status}` };
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error("GYG API fetch error:", error);
        return { error: "Failed to fetch from GYG API" };
    }
}

export async function getActivityDetails(activityId: string): Promise<GygSearchResponse> {
    try {
        const url = `${GYG_API_BASE}/activities/${activityId}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": getAuthHeader(),
                "Accept": "application/json",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            return { error: `API Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("GYG API fetch error:", error);
        return { error: "Failed to fetch activity details" };
    }
}
