import { NextRequest, NextResponse } from "next/server";
import { validateGygAuth } from "@/lib/auth/gyg-auth";

// Type definitions
interface ProductParams {
    params: Promise<{ productId: string }>;
}

// Mock product data - same as products/route.ts
const MOCK_PRODUCTS = [
    {
        product_id: "TRIP-001",
        title: "Berlin City Walking Tour",
        description: "Discover Berlin's historic landmarks on this 3-hour guided walking tour.",
        duration_minutes: 180,
        max_participants: 20,
        price_per_person: 29.99,
        currency: "EUR",
        categories: ["walking-tour", "culture"],
        meeting_point: {
            address: "Brandenburg Gate, Berlin",
            latitude: 52.5163,
            longitude: 13.3777,
        },
        included: ["Professional guide", "Audio headset"],
        not_included: ["Food and drinks", "Gratuities"],
    },
    {
        product_id: "TRIP-002",
        title: "Munich Beer Garden Experience",
        description: "Taste authentic Bavarian beers at Munich's best beer gardens.",
        duration_minutes: 240,
        max_participants: 15,
        price_per_person: 49.99,
        currency: "EUR",
        categories: ["food-drink", "culture"],
        meeting_point: {
            address: "Marienplatz, Munich",
            latitude: 48.1374,
            longitude: 11.5755,
        },
        included: ["3 beer tastings", "Local snacks", "Local guide"],
        not_included: ["Additional drinks", "Transportation"],
    },
];

export async function GET(request: NextRequest, { params }: ProductParams) {
    const authError = validateGygAuth(request);
    if (authError) return authError;

    const { productId } = await params;
    const product = MOCK_PRODUCTS.find((p) => p.product_id === productId);

    if (!product) {
        return NextResponse.json(
            { status: 404, error: "Product not found" },
            { status: 200 } // GYG spec: always return 200, error in body
        );
    }

    return NextResponse.json({
        status: 200,
        data: product,
    });
}
