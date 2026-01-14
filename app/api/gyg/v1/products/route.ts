import { NextRequest, NextResponse } from "next/server";
import { validateGygAuth } from "@/lib/auth/gyg-auth";

// Mock product data - replace with database queries later
const MOCK_PRODUCTS = [
    {
        product_id: "TRIP-001",
        title: "Berlin City Walking Tour",
        description: "Discover Berlin's historic landmarks",
        duration_minutes: 180,
        max_participants: 20,
        price_per_person: 29.99,
        currency: "EUR",
        categories: ["walking-tour", "culture"],
    },
    {
        product_id: "TRIP-002",
        title: "Munich Beer Garden Experience",
        description: "Taste authentic Bavarian beers",
        duration_minutes: 240,
        max_participants: 15,
        price_per_person: 49.99,
        currency: "EUR",
        categories: ["food-drink", "culture"],
    },
];

export async function GET(request: NextRequest) {
    const authError = validateGygAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);

    // Search/filter parameters
    const query = searchParams.get("q")?.toLowerCase();
    const category = searchParams.get("category")?.toLowerCase();
    const minPrice = searchParams.get("min_price") ? parseFloat(searchParams.get("min_price")!) : null;
    const maxPrice = searchParams.get("max_price") ? parseFloat(searchParams.get("max_price")!) : null;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    let filteredProducts = [...MOCK_PRODUCTS];

    // Filter by search query (title or description)
    if (query) {
        filteredProducts = filteredProducts.filter(
            (p) =>
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
        );
    }

    // Filter by category
    if (category) {
        filteredProducts = filteredProducts.filter((p) =>
            p.categories.some((c) => c.toLowerCase().includes(category))
        );
    }

    // Filter by price range
    if (minPrice !== null) {
        filteredProducts = filteredProducts.filter((p) => p.price_per_person >= minPrice);
    }
    if (maxPrice !== null) {
        filteredProducts = filteredProducts.filter((p) => p.price_per_person <= maxPrice);
    }

    // Apply pagination
    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return NextResponse.json({
        status: 200,
        data: {
            products: paginatedProducts,
            total,
            limit,
            offset,
            has_more: offset + limit < total,
        },
    });
}
