import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    // TODO: Implement GetYourGuide API Proxy with caching
    return NextResponse.json({
        message: "Search activities endpoint",
        query: q,
        results: [],
    });
}
