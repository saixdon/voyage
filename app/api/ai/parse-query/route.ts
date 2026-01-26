import { NextRequest, NextResponse } from "next/server";
import { parseQueryWithDeepSeek } from "@/lib/api/deepseek-client";

export async function POST(request: NextRequest) {
    try {
        const { query, locale } = await request.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const parsed = await parseQueryWithDeepSeek(query, locale || "de");

        return NextResponse.json(parsed);
    } catch (error) {
        console.error("AI Parse Route Error:", error);
        return NextResponse.json({ error: "Failed to parse query" }, { status: 500 });
    }
}
