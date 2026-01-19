import { NextResponse } from "next/server";
import { getTrendingDestinations } from "@/lib/api/viator-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get("locale") || "en";
        const destinations = await getTrendingDestinations(locale);
        return NextResponse.json({
            success: true,
            destinations,
        });
    } catch (error) {
        console.error("Trending Destinations API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch destinations" },
            { status: 500 }
        );
    }
}
