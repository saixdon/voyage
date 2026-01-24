import { NextRequest, NextResponse } from "next/server";
// import { searchActivities as searchGygActivities } from "@/lib/api/gyg-client";
import { searchViatorProducts } from "@/lib/api/viator-client";
import { createClient } from "@/lib/supabase/server"; // Use server client
import { Activity } from "@/types";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const dateFrom = searchParams.get("from"); // YYYY-MM-DD
    const dateTo = searchParams.get("to");     // YYYY-MM-DD
    const limit = parseInt(searchParams.get("limit") || "20");
    const locale = searchParams.get("locale") || "en";

    let activities: Activity[] = [];
    let source = "none";
    let total = 0;

    // 0. Try Local Database First (Ingestion Model)
    // This provides the fastest and most reliable results from our synced data
    try {
        const supabase = await createClient();

        // Simple text search on title or description
        // In a real production app, we would use Full Text Search (tsvector)
        let queryBuilder = supabase
            .from('products')
            .select('*')
            .eq('status', 'ACTIVE'); // Only active products

        if (query) {
            queryBuilder = queryBuilder.ilike('title', `%${query}%`);
        }

        const { data: dbProducts, error } = await queryBuilder.limit(limit);

        if (!error && dbProducts && dbProducts.length > 0) {
            activities = dbProducts.map((p: any) => ({
                id: p.product_code,
                title: p.title,
                location: 'Viator Destination', // We might need to join destinations table or store city name
                image: (p.images && p.images['0']?.variants?.[0]?.url) || "",
                price: p.pricing?.summary?.fromPrice || 0,
                currency: p.pricing?.currency || "EUR",
                rating: p.reviews?.combinedAverageRating || 0,
                reviewCount: p.reviews?.totalReviews || 0,
                duration: p.duration?.fixedDurationInMinutes ? `${Math.floor(p.duration.fixedDurationInMinutes / 60)}h ${p.duration.fixedDurationInMinutes % 60}m` : "",
                productCode: p.product_code,
                source: 'viator-db'
            }));
            source = "database";
            total = activities.length;
            console.log(`Found ${activities.length} activities in local DB for "${query}"`);
        }
    } catch (dbError) {
        console.error("Database Search Error:", dbError);
    }


    // 1. GetYourGuide fallback removed due to API access issues (HTML 404s).
    // Proceeding directly to Viator API.

    // 2. Try Viator Live API if GYG failed or returned nothing OR if we need more results
    if (activities.length < limit) {
        try {
            console.log(`DB returned only ${activities.length} results. Fetching from Viator API...`);
            const viatorResult = await searchViatorProducts(
                query,
                limit - activities.length, // Fetch enough to fill the limit (or just fetch limit)
                dateFrom || undefined,
                dateTo || undefined,
                locale
            );

            if (viatorResult.activities && viatorResult.activities.length > 0) {
                const newActivities = viatorResult.activities as unknown as Activity[];

                // Merge and deduplicate based on ID or ProductCode
                const existingIds = new Set(activities.map(a => a.id));
                const uniqueNew = newActivities.filter(a => !existingIds.has(a.id));

                activities = [...activities, ...uniqueNew];

                // Update source to reflect mixed or API
                source = activities.length === uniqueNew.length ? "viator-api" : "mixed";
                total = (total || 0) + (viatorResult.totalCount || 0); // Estimate total
            }
        } catch (e) {
            console.error("Viator Search Error:", e);
        }
    }

    // 3. Mock Fallback (ONLY if absolutely nothing found and query is generic)
    // Removed forceful mock fallback to avoid confusion during testing. 
    // Now returns empty list if nothing found, which is correct behavior.

    console.log(`returning ${activities.length} activities for query "${query}" (Source: ${source})`);

    return NextResponse.json({
        source,
        activities,
        total,
    });
}

