"use client";

import React from "react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import TripCard from "./TripCard";

interface TripListProps {
    trips: any[];
}

export default function TripList({ trips }: TripListProps) {
    const t = useTranslations("dashboard.trips");

    if (!trips || trips.length === 0) {
        return (
            <div className="text-center py-20 bg-surface border border-white/10 rounded-3xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-muted-foreground">
                        flight_takeoff
                    </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                    {t("empty.title")}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    {t("empty.description")}
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined">add</span>
                    {t("empty.action")}
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
            ))}
        </div>
    );
}
