import { NextResponse } from "next/server";
import { getDisplayCategories, fetchViatorTags } from "@/lib/api/viator-client";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get("locale") || "de";
        const raw = searchParams.get("raw") === "true";

        if (raw) {
            // Return raw tags from API (for debugging)
            const tags = await fetchViatorTags();
            return NextResponse.json({
                success: true,
                count: tags.length,
                tags,
            });
        }

        // Return transformed categories for display
        const categories = await getDisplayCategories(locale);

        return NextResponse.json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        console.error("Tags API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch tags",
                categories: []
            },
            { status: 500 }
        );
    }
}
