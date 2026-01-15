import { NextRequest, NextResponse } from "next/server";
import { searchViatorProducts } from "@/lib/api/viator-client";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    // Try to fetch from Viator Partner API
    const viatorResult = await searchViatorProducts(query, limit);

    if (viatorResult.activities && viatorResult.activities.length > 0) {
        return NextResponse.json({
            source: "viator",
            activities: viatorResult.activities,
            total: viatorResult.totalCount || viatorResult.activities.length,
        });
    }

    // Return empty result if nothing found (no mock fallback)
    return NextResponse.json({
        source: "viator",
        activities: [],
        total: 0,
        viatorError: viatorResult.error || "No products found",
    });
}
