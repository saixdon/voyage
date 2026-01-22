"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations, useFormatter } from "next-intl";

interface TripCardProps {
    trip: {
        id: string;
        destination: string;
        summary: string | null;
        query?: string | null;
        createdAt: Date;
        items?: any[];
    };
}

export default function TripCard({ trip }: TripCardProps) {
    const t = useTranslations("dashboard.trips");
    const format = useFormatter();

    // Placeholder images based on destination if no custom image
    // In a real app we'd fetch an Unsplash image or use one from the items
    const getImageForDestination = (dest: string) => {
        // Simple mock logic
        return `/destinations/${dest.toLowerCase()}.jpg`;
    };

    return (
        <Link
            href={`/trips/${trip.id}`}
            className="block group bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
        >
            <div className="flex flex-col sm:flex-row h-full">
                {/* Image Section */}
                <div className="w-full sm:w-48 h-48 sm:h-auto relative bg-white/5">
                    {/* We use a placeholder div or Next Image if we had a real URL */}
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-white/5 to-white/10 group-hover:scale-105 transition-transform duration-500">
                        <span className="material-symbols-outlined text-4xl">map</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {trip.destination}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                            {format.dateTime(new Date(trip.createdAt), { dateStyle: "medium" })}
                        </span>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {trip.summary || t("noSummary")}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            <span>5 Days</span> {/* Mock duration */}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">attractions</span>
                            <span>{trip.items?.length || 0} Activities</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
