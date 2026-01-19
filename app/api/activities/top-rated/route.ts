import { NextResponse } from "next/server";
import { searchViatorProducts, TransformedActivity } from "@/lib/api/viator-client";

export const dynamic = 'force-dynamic'; // Defaults to auto, but we want to ensure we don't statically freeze without data

const TOP_RATED_QUERIES = [
    { query: "Colosseum", badge: "Bestseller" },
    { query: "Louvre Museum", badge: "Likely to sell out" },
    { query: "Great Barrier Reef", badge: "Bucket List" },
    { query: "Burj Khalifa", badge: "Top Pick" }
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get("locale") || "en";

        const results = await Promise.all(
            TOP_RATED_QUERIES.map(async (item) => {
                // Pass locale and undefined for start/end dates
                const searchResult = await searchViatorProducts(item.query, 1, undefined, undefined, locale);
                if (searchResult.activities && searchResult.activities.length > 0) {
                    return {
                        ...searchResult.activities[0],
                        badge: item.badge
                    };
                }
                return null;
            })
        );

        const activities = results.filter((act): act is (TransformedActivity & { badge: string }) => act !== null);

        return NextResponse.json(activities);
    } catch (error) {
        console.error("Failed to fetch top rated activities:", error);
        return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
}
