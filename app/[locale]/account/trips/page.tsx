import React from "react";
import { createClient } from "@/lib/supabase/server";
import TripList from "@/components/dashboard/TripList";

export default async function TripsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch trips
    const { data: trips } = await supabase
        .from("trips")
        .select(`
            id,
            destination,
            summary,
            query,
            created_at,
            trip_items (count)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

    // Transform data
    const transformedTrips = trips?.map((trip: any) => ({
        id: trip.id,
        destination: trip.destination,
        summary: trip.summary,
        query: trip.query,
        createdAt: trip.created_at,
        items: Array(trip.trip_items?.[0]?.count || 0), // Mocking items array for length check
    })) || [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">My Planning</h1>
                <p className="text-muted-foreground">
                    Your saved trips and itineraries.
                </p>
            </div>

            <TripList trips={transformedTrips} />
        </div>
    );
}
