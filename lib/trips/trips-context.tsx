"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { type TripPlanResponse, type TripActivity } from "@/app/actions/ai-planner";

// Types
export interface SavedTrip {
    id: string;
    user_id: string;
    destination: string;
    summary: string;
    query: string;
    created_at: string;
}

export interface TripItem {
    id: string;
    trip_id: string;
    activity_id: string;
    day: number;
    time_of_day: 'morning' | 'afternoon' | 'evening';
    title: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    product_url: string;
    status: 'proposed' | 'pending' | 'booked';
    booked_at?: string;
}

export interface SavedTripWithItems extends SavedTrip {
    items: TripItem[];
}

interface TripsContextType {
    trips: SavedTripWithItems[];
    currentTrip: SavedTripWithItems | null;
    isLoading: boolean;
    saveTrip: (plan: TripPlanResponse, query: string) => Promise<SavedTripWithItems | null>;
    loadTrips: () => Promise<void>;
    loadTrip: (tripId: string) => Promise<void>;
    updateItemStatus: (tripId: string, itemId: string, status: 'proposed' | 'pending' | 'booked') => Promise<void>;
    deleteTrip: (tripId: string) => Promise<void>;
}

const TripsContext = createContext<TripsContextType>({
    trips: [],
    currentTrip: null,
    isLoading: false,
    saveTrip: async () => null,
    loadTrips: async () => { },
    loadTrip: async () => { },
    updateItemStatus: async () => { },
    deleteTrip: async () => { },
});

export const useTrips = () => useContext(TripsContext);

export function TripsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [trips, setTrips] = useState<SavedTripWithItems[]>([]);
    const [currentTrip, setCurrentTrip] = useState<SavedTripWithItems | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load trips on user change
    useEffect(() => {
        if (user) {
            loadTrips();
        } else {
            setTrips([]);
            setCurrentTrip(null);
        }
    }, [user]);

    const loadTrips = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/trips");
            if (response.ok) {
                const data = await response.json();
                setTrips(data);
            }
        } catch (error) {
            console.error("Failed to load trips:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrip = async (tripId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/trips/${tripId}`);
            if (response.ok) {
                const data = await response.json();
                setCurrentTrip(data);
            }
        } catch (error) {
            console.error("Failed to load trip:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveTrip = async (plan: TripPlanResponse, query: string): Promise<SavedTripWithItems | null> => {
        if (!user) return null;

        try {
            const response = await fetch("/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination: plan.destination,
                    summary: plan.summary,
                    query: query,
                    items: plan.itinerary.map(item => ({
                        activity_id: item.activityId,
                        day: item.day,
                        time_of_day: item.timeOfDay,
                        title: item.title,
                        description: item.description,
                        price: item.price,
                        currency: item.currency,
                        image: item.image,
                        product_url: item.productUrl,
                        status: 'proposed'
                    }))
                }),
            });

            if (response.ok) {
                const savedTrip = await response.json();
                setTrips(prev => [savedTrip, ...prev]);
                setCurrentTrip(savedTrip);
                return savedTrip;
            }
            return null;
        } catch (error) {
            console.error("Error saving trip:", error);
            return null;
        }
    };

    const updateItemStatus = async (tripId: string, itemId: string, status: 'proposed' | 'pending' | 'booked') => {
        // Optimistic update
        setTrips(prev => prev.map(trip => {
            if (trip.id === tripId) {
                return {
                    ...trip,
                    items: trip.items.map(item =>
                        item.id === itemId
                            ? { ...item, status, booked_at: status === 'booked' ? new Date().toISOString() : undefined }
                            : item
                    )
                };
            }
            return trip;
        }));

        if (currentTrip?.id === tripId) {
            setCurrentTrip(prev => prev ? {
                ...prev,
                items: prev.items.map(item =>
                    item.id === itemId
                        ? { ...item, status, booked_at: status === 'booked' ? new Date().toISOString() : undefined }
                        : item
                )
            } : null);
        }

        try {
            await fetch(`/api/trips/${tripId}/items/${itemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            console.error("Error updating item status:", error);
            // Reload to revert optimistic update
            loadTrips();
        }
    };

    const deleteTrip = async (tripId: string) => {
        // Optimistic update
        setTrips(prev => prev.filter(trip => trip.id !== tripId));
        if (currentTrip?.id === tripId) {
            setCurrentTrip(null);
        }

        try {
            await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
        } catch (error) {
            console.error("Error deleting trip:", error);
            loadTrips();
        }
    };

    return (
        <TripsContext.Provider value={{
            trips,
            currentTrip,
            isLoading,
            saveTrip,
            loadTrips,
            loadTrip,
            updateItemStatus,
            deleteTrip
        }}>
            {children}
        </TripsContext.Provider>
    );
}
