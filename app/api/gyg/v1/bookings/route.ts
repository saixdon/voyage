import { NextRequest, NextResponse } from "next/server";
import { validateGygAuth } from "@/lib/auth/gyg-auth";

// In-memory store for bookings (replace with database)
const bookings: Map<string, Booking> = new Map();

interface BookingRequest {
    product_id: string;
    date: string;
    time_slot: string;
    participants: {
        adults: number;
        children?: number;
    };
    customer: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
    };
    booking_type: "reservation" | "booking";
}

interface Booking {
    booking_reference: string;
    product_id: string;
    date: string;
    time_slot: string;
    participants: { adults: number; children?: number };
    customer: { first_name: string; last_name: string; email: string; phone?: string };
    status: "reserved" | "confirmed" | "cancelled";
    created_at: string;
    voucher_code?: string;
}

function generateReference(): string {
    return `VYG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function generateVoucherCode(): string {
    return `V-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
    const authError = validateGygAuth(request);
    if (authError) return authError;

    let body: BookingRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ status: 400, error: "Invalid JSON body" });
    }

    const { product_id, date, time_slot, participants, customer, booking_type } = body;

    // Validate required fields
    if (!product_id || !date || !time_slot || !participants || !customer) {
        return NextResponse.json({
            status: 400,
            error: "Missing required fields",
        });
    }

    const bookingReference = generateReference();
    const isConfirmation = booking_type === "booking";

    const booking: Booking = {
        booking_reference: bookingReference,
        product_id,
        date,
        time_slot,
        participants,
        customer,
        status: isConfirmation ? "confirmed" : "reserved",
        created_at: new Date().toISOString(),
        voucher_code: isConfirmation ? generateVoucherCode() : undefined,
    };

    bookings.set(bookingReference, booking);

    return NextResponse.json({
        status: 200,
        data: {
            booking_reference: bookingReference,
            status: booking.status,
            voucher_code: booking.voucher_code,
            message: isConfirmation
                ? "Booking confirmed successfully"
                : "Reservation created. Please confirm within 15 minutes.",
        },
    });
}

export async function GET(request: NextRequest) {
    const authError = validateGygAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (reference) {
        const booking = bookings.get(reference);
        if (!booking) {
            return NextResponse.json({ status: 404, error: "Booking not found" });
        }
        return NextResponse.json({ status: 200, data: booking });
    }

    // Return all bookings
    return NextResponse.json({
        status: 200,
        data: {
            bookings: Array.from(bookings.values()),
            total: bookings.size,
        },
    });
}

export async function DELETE(request: NextRequest) {
    const authError = validateGygAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
        return NextResponse.json({ status: 400, error: "Missing booking reference" });
    }

    const booking = bookings.get(reference);
    if (!booking) {
        return NextResponse.json({ status: 404, error: "Booking not found" });
    }

    booking.status = "cancelled";
    bookings.set(reference, booking);

    return NextResponse.json({
        status: 200,
        data: {
            booking_reference: reference,
            status: "cancelled",
            message: "Booking cancelled successfully",
        },
    });
}
