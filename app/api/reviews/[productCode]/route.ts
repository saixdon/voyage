import { NextRequest, NextResponse } from "next/server";
import { getViatorProductReviews } from "@/lib/api/viator-client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productCode: string }> }
) {
    try {
        const { productCode } = await params;
        const { searchParams } = new URL(request.url);

        const start = parseInt(searchParams.get("start") || "1", 10);
        const count = parseInt(searchParams.get("count") || "10", 10);

        // Hole Bewertungen von Viator
        const reviewsResult = await getViatorProductReviews(productCode, count, start);

        return NextResponse.json(reviewsResult);
    } catch (error) {
        console.error("Reviews API Error:", error);
        return NextResponse.json({ error: "Failed to fetch reviews", reviews: [] }, { status: 500 });
    }
}
