"use client";

import React from "react";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { ActivityCard } from "@/components/features/ActivityCard";
import { Link } from "@/lib/i18n/navigation";

export default function DashboardFavoritesPage() {
    const { favorites, isLoading } = useFavorites();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-dark pt-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8">
                        Gespeicherte Aktivitäten
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[4/5] rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark pt-24 px-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    Gespeicherte Aktivitäten
                </h1>

                {favorites.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">
                            favorite_border
                        </span>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Noch keine Favoriten
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Speichern Sie Aktivitäten, die Ihnen gefallen, um sie hier wiederzufinden.
                        </p>
                        <Link
                            href="/search?q=popular"
                            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Aktivitäten entdecken
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((fav) => (
                            <ActivityCard
                                key={fav.activity_id}
                                id={fav.activity_id}
                                title={fav.activity_title}
                                location={fav.activity_location || ""}
                                image={fav.activity_image || ""}
                                price={fav.activity_price || 0}
                                currency={fav.activity_currency || "EUR"}
                                rating={fav.activity_rating || 0}
                                reviewCount={fav.activity_review_count || 0}
                                duration={fav.activity_duration || ""}
                                isSaved={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
