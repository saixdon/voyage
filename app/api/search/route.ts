import { NextRequest, NextResponse } from "next/server";
import { searchActivities as searchGygActivities } from "@/lib/api/gyg-client";
import { searchViatorProducts } from "@/lib/api/viator-client";
import { Activity } from "@/types";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    let activities: Activity[] = [];
    let source = "none";
    let total = 0;

    // 1. Try GetYourGuide (Primary)
    try {
        const gygResult = await searchGygActivities(query, limit);
        if (gygResult.data?.activities && gygResult.data.activities.length > 0) {
            activities = gygResult.data.activities.map((act: any) => ({
                id: act.activity_id.toString(),
                title: act.title,
                location: act.location?.city || act.location?.country || "",
                image: act.pictures?.[0]?.url || "",
                price: act.price?.values?.amount || 0,
                currency: act.price?.values?.currency || "EUR",
                rating: act.rating || 0,
                reviewCount: act.reviews_count || 0,
                duration: act.duration || "",
            }));
            source = "gyg";
            total = activities.length;
        }
    } catch (e) {
        console.error("GYG Search Error:", e);
    }

    // 2. Try Viator if GYG failed or returned nothing
    if (activities.length === 0) {
        try {
            const viatorResult = await searchViatorProducts(query, limit);
            if (viatorResult.activities && viatorResult.activities.length > 0) {
                activities = viatorResult.activities as unknown as Activity[];
                source = "viator";
                total = viatorResult.totalCount || activities.length;
            }
        } catch (e) {
            console.error("Viator Search Error:", e);
        }
    }

    // 3. Mock Fallback (only if no results from real APIs)
    if (activities.length === 0 && query) {
        activities = [
            {
                id: "mock-1",
                title: `Premium Experience in ${query}`,
                location: query,
                image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
                price: 49.99,
                currency: "EUR",
                rating: 4.8,
                reviewCount: 124,
                duration: "3 hours",
                badge: "bestseller"
            },
            {
                id: "mock-2",
                title: `${query} City Highlights Tour`,
                location: query,
                image: "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=800&q=80",
                price: 29.99,
                currency: "EUR",
                rating: 4.5,
                reviewCount: 85,
                duration: "2 hours"
            }
        ];
        source = "mock";
        total = activities.length;
    }

    return NextResponse.json({
        source,
        activities,
        total,
    });
}
