import { NextRequest, NextResponse } from "next/server";
import { validateGygAuth } from "@/lib/auth/gyg-auth";

// Mock availability data
const MOCK_AVAILABILITY: Record<string, { date: string; slots: { time: string; available: number }[] }[]> = {
    "TRIP-001": [
        {
            date: "2026-01-20",
            slots: [
                { time: "09:00", available: 15 },
                { time: "14:00", available: 20 },
            ],
        },
        {
            date: "2026-01-21",
            slots: [
                { time: "09:00", available: 10 },
                { time: "14:00", available: 8 },
            ],
        },
    ],
    "TRIP-002": [
        {
            date: "2026-01-20",
            slots: [{ time: "17:00", available: 12 }],
        },
        {
            date: "2026-01-21",
            slots: [{ time: "17:00", available: 15 }],
        },
    ],
};

interface AvailabilityRequest {
    product_id: string;
    from_date: string;
    to_date: string;
}

export async function POST(request: NextRequest) {
    const authError = validateGygAuth(request);
    if (authError) return authError;

    let body: AvailabilityRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({
            status: 400,
            error: "Invalid JSON body",
        });
    }

    const { product_id, from_date, to_date } = body;

    if (!product_id || !from_date || !to_date) {
        return NextResponse.json({
            status: 400,
            error: "Missing required fields: product_id, from_date, to_date",
        });
    }

    const productAvailability = MOCK_AVAILABILITY[product_id];

    if (!productAvailability) {
        return NextResponse.json({
            status: 404,
            error: "Product not found",
        });
    }

    // Filter by date range (simple string comparison for mock)
    const filteredAvailability = productAvailability.filter(
        (a) => a.date >= from_date && a.date <= to_date
    );

    return NextResponse.json({
        status: 200,
        data: {
            product_id,
            availability: filteredAvailability,
        },
    });
}
