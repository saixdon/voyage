import React from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import BookingList from "@/components/dashboard/BookingList";

export default async function BookingsPage() {
    // We don't use useTranslations here because it's an async server component
    // We pass translation logic to client components if needed, or use getTranslations
    // However, the page title doesn't need to be client side
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch bookings joined with products
    const { data: bookings } = await supabase
        .from("bookings")
        .select(`
            id,
            status,
            travel_date,
            total_price,
            currency,
            product_code,
            products (
                title,
                primary_image
            )
        `)
        .eq("booker_email", user?.email) // Assuming we link by email for now, ideally by user_id if we had it
        .order("created_at", { ascending: false });

    // Transform data to match BookingCardProps
    const transformedBookings = bookings?.map((booking: any) => ({
        id: booking.id,
        status: booking.status,
        travelDate: booking.travel_date,
        totalPrice: booking.total_price,
        currency: booking.currency,
        product: {
            title: booking.products?.title || "Unknown Experience",
            image: booking.products?.primary_image || null,
        },
    })) || [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
                <p className="text-muted-foreground">
                    Manage your upcoming and past adventures.
                </p>
            </div>

            <BookingList bookings={transformedBookings} />
        </div>
    );
}
