"use client";

import React, { useEffect, use } from "react";
import Link from "next/link";
import { useTrips } from "@/lib/trips/trips-context";
import { useAuth } from "@/lib/auth/auth-context";
import { AIPlannerResults } from "@/components/features/AIPlannerResults";

export default function TripDetailPage({
    params,
}: {
    params: Promise<{ tripId: string }>;
}) {
    const { tripId } = use(params);
    const { user } = useAuth();
    const { currentTrip, loadTrip, isLoading } = useTrips();

    useEffect(() => {
        if (user && tripId) {
            loadTrip(tripId);
        }
    }, [user, tripId]);

    if (!user) {
        return (
            <div className="min-h-screen bg-background-dark pt-24 px-6">
                <div className="max-w-7xl mx-auto text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">login</span>
                    <h2 className="text-xl font-bold text-white mb-2">Bitte einloggen</h2>
                </div>
            </div>
        );
    }

    if (isLoading || !currentTrip) {
        return (
            <div className="min-h-screen bg-background-dark pt-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-10 w-64 bg-white/10 rounded-lg mb-4"></div>
                        <div className="h-6 w-96 bg-white/10 rounded-lg mb-8"></div>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-white/5 rounded-2xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Reconstruct the plan format for AIPlannerResults
    const plan = {
        destination: currentTrip.destination,
        summary: currentTrip.summary,
        itinerary: currentTrip.items.map(item => ({
            day: item.day,
            timeOfDay: item.time_of_day,
            activityId: item.activity_id,
            title: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency,
            image: item.image,
            productUrl: item.product_url,
            productCode: item.activity_id // Required field mapping
        }))
    };

    return (
        <div className="min-h-screen bg-background-dark pt-24 px-6 pb-16">
            <div className="max-w-7xl mx-auto">
                {/* Back Navigation */}
                <Link
                    href="/dashboard/trips"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Zurück zu meinen Reisen
                </Link>

                {/* Trip Results with booking status */}
                <AIPlannerResults
                    plan={plan}
                    tripId={currentTrip.id}
                    savedItems={currentTrip.items}
                    query={currentTrip.query}
                />
            </div>
        </div>
    );
}
