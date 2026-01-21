"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTrips } from "@/lib/trips/trips-context";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardTripsPage() {
    const { user } = useAuth();
    const { trips, isLoading, loadTrips, deleteTrip } = useTrips();

    useEffect(() => {
        if (user) {
            loadTrips();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-background-dark pt-24 px-6">
                <div className="max-w-7xl mx-auto text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">login</span>
                    <h2 className="text-xl font-bold text-white mb-2">Bitte einloggen</h2>
                    <p className="text-gray-400">Loggen Sie sich ein, um Ihre gespeicherten Reisen zu sehen.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-dark pt-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8">Meine Planung</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-[4/3] rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark pt-24 px-6 pb-16">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Meine Planung</h1>
                        <p className="text-gray-400">Verwalten Sie Ihre KI-generierten Reisepläne</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-bold rounded-full hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg shadow-purple-500/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Neue Planung erstellen
                    </Link>
                </div>

                {trips.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">
                            travel_explore
                        </span>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Noch keine Planung gespeichert
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Nutzen Sie den KI-Planer auf der Startseite, um Ihre erste Traumreise zu erstellen.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined mr-2">auto_awesome</span>
                            Planung mit KI erstellen
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip) => {
                            const bookedCount = trip.items?.filter(i => i.status === 'booked').length || 0;
                            const totalCount = trip.items?.length || 0;
                            const progress = totalCount > 0 ? (bookedCount / totalCount) * 100 : 0;

                            return (
                                <div
                                    key={trip.id}
                                    className="relative group bg-card-dark border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                                >
                                    {/* Header Image */}
                                    <div className="relative h-40 overflow-hidden">
                                        {trip.items?.[0]?.image ? (
                                            <Image
                                                src={trip.items[0].image}
                                                alt={trip.destination}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-primary/20 to-purple-600/20"></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-transparent to-transparent"></div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (confirm('Möchten Sie diese Reise wirklich löschen?')) {
                                                    deleteTrip(trip.id);
                                                }
                                            }}
                                            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/50"
                                        >
                                            <span className="material-symbols-outlined text-white text-sm">delete</span>
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                            <span className="text-primary text-sm font-bold">{trip.destination}</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                                            {trip.summary || `Reise nach ${trip.destination}`}
                                        </h3>

                                        <p className="text-gray-400 text-sm mb-4 line-clamp-1">
                                            {trip.query}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>Buchungsfortschritt</span>
                                                <span>{bookedCount}/{totalCount} gebucht</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Status Badges */}
                                        <div className="flex gap-2 mb-4">
                                            {trip.items?.filter(i => i.status === 'booked').length > 0 && (
                                                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                                                    {trip.items.filter(i => i.status === 'booked').length} gebucht
                                                </span>
                                            )}
                                            {trip.items?.filter(i => i.status === 'pending').length > 0 && (
                                                <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">
                                                    {trip.items.filter(i => i.status === 'pending').length} ausstehend
                                                </span>
                                            )}
                                        </div>

                                        {/* View Button */}
                                        <Link
                                            href={`/dashboard/trips/${trip.id}`}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                                        >
                                            Planung anzeigen
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
