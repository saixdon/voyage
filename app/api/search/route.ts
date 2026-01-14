import { NextRequest, NextResponse } from "next/server";
import { searchViatorProducts } from "@/lib/api/viator-client";
import { MOCK_ACTIVITIES } from "@/lib/api/mockData";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Try to fetch from Viator Partner API first
    const viatorResult = await searchViatorProducts(query, limit);

    if (viatorResult.activities && viatorResult.activities.length > 0) {
        return NextResponse.json({
            source: "viator",
            activities: viatorResult.activities,
            total: viatorResult.activities.length,
        });
    }

    // Fallback to mock data if Viator API fails or returns no results
    const filtered = MOCK_ACTIVITIES.filter(
        (activity) =>
            activity.title.toLowerCase().includes(query.toLowerCase()) ||
            activity.location.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
        source: "mock",
        activities: filtered,
        total: filtered.length,
        viatorError: viatorResult.error || null,
    });
}
