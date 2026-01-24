import { NextResponse } from "next/server";
import { searchViatorProducts, TransformedActivity, TRENDING_DESTINATION_IDS } from "@/lib/api/viator-client";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get("locale") || "en";

        // Select 4 random destinations from our trending list to show variety
        const shuffledDestinations = [...TRENDING_DESTINATION_IDS]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

        const promises = shuffledDestinations.map(async (dest) => {
            // Fetch top 2 activities for this destination
            // We use "tour" as a generic query to get good coverage
            const result = await searchViatorProducts(
                "tour",
                2,
                undefined,
                undefined,
                locale,
                { destinationId: dest.id.toString() }
            );

            // Inject correct location name from our source of truth (dest) if missing
            return result.activities.map(act => ({
                ...act,
                location: act.location || `${dest.name}, ${dest.country}`
            }));
        });

        const resultsArray = await Promise.all(promises);

        // Flatten array
        const allActivities = resultsArray.flat();

        // Assign badges randomly for visual flair
        const badges = ["Bestseller", "Likely to sell out", "Top Pick", "Bucket List"];

        const activitiesWithBadges = allActivities.map((activity) => ({
            ...activity,
            badge: Math.random() > 0.7 ? badges[Math.floor(Math.random() * badges.length)] : undefined
        }));

        // Shuffle the final mix so cities are interleaved
        const shuffledActivities = activitiesWithBadges.sort(() => 0.5 - Math.random());

        return NextResponse.json(shuffledActivities);
    } catch (error) {
        console.error("Failed to fetch top rated activities:", error);
        return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
}
