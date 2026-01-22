"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export interface FavoriteActivity {
    id: string; // ID from our DB
    activity_id: string; // ID from provider (Viator/GYG)
    activity_title: string;
    activity_image?: string;
    activity_location?: string;
    activity_price?: number;
    activity_currency?: string;
    activity_rating?: number;
    activity_review_count?: number;
    activity_duration?: string;
    created_at?: string;
}

interface FavoritesContextType {
    favorites: FavoriteActivity[];
    isLoading: boolean;
    isFavorite: (activityId: string) => boolean;
    addFavorite: (activity: Omit<FavoriteActivity, "id" | "created_at" | "user_id">) => Promise<void>;
    removeFavorite: (activityId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    isLoading: false,
    isFavorite: () => false,
    addFavorite: async () => { },
    removeFavorite: async () => { },
});

import { AuthModal } from "@/components/features/AuthModal";

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteActivity[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingFavorite, setPendingFavorite] = useState<Omit<FavoriteActivity, "id" | "created_at" | "user_id"> | null>(null);

    // Effect to handle pending favorite after login
    useEffect(() => {
        if (user && pendingFavorite) {
            addFavorite(pendingFavorite);
            setPendingFavorite(null);
        }
    }, [user, pendingFavorite]);

    // Laden der Favoriten beim Start oder wenn sich der User ändert
    useEffect(() => {
        if (!user) {
            setFavorites([]);
            return;
        }

        const fetchFavorites = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/favorites");
                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data);
                }
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    const isFavorite = (activityId: string) => {
        return favorites.some((fav) => fav.activity_id === activityId);
    };

    const addFavorite = async (activity: Omit<FavoriteActivity, "id" | "created_at" | "user_id">) => {
        if (!user) {
            setPendingFavorite(activity);
            setShowAuthModal(true);
            return;
        }

        // Optimistisches Update
        const tempId = Math.random().toString(36).substring(7);
        const newFav: FavoriteActivity = { ...activity, id: tempId };
        setFavorites((prev) => [...prev, newFav]);

        try {
            const response = await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(activity),
            });

            if (!response.ok) {
                throw new Error("Failed to add favorite");
            }

            const savedFav = await response.json();
            // Ersetze optimistisches Update durch echte Daten
            setFavorites((prev) => prev.map(f => f.id === tempId ? savedFav : f));

        } catch (error) {
            console.error("Error adding favorite:", error);
            // Rollback
            setFavorites((prev) => prev.filter((f) => f.id !== tempId));
        }
    };

    const removeFavorite = async (activityId: string) => { // activityId is the provider ID
        if (!user) return;

        // Finde den Eintrag in unseren Favoriten
        const favEntry = favorites.find(f => f.activity_id === activityId);
        if (!favEntry) return;

        // Optimistisches Update
        const previousFavorites = [...favorites];
        setFavorites((prev) => prev.filter((f) => f.activity_id !== activityId));

        try {
            const response = await fetch(`/api/favorites?id=${activityId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to remove favorite");
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
            // Rollback
            setFavorites(previousFavorites);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isLoading, isFavorite, addFavorite, removeFavorite }}>
            {children}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => {
                    // Triggers re-render via AuthContext update, which triggers the effect above
                }}
            />
        </FavoritesContext.Provider>
    );
}
