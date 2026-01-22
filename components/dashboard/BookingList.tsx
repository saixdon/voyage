"use client";

import React from "react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import BookingCard from "./BookingCard";

interface BookingListProps {
    bookings: any[]; // We can rely on the inferred types or define strict ones later
}

export default function BookingList({ bookings }: BookingListProps) {
    const t = useTranslations("dashboard.bookings");

    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-center py-20 bg-surface border border-white/10 rounded-3xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-muted-foreground">
                        confirmation_number
                    </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                    {t("empty.title")}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    {t("empty.description")}
                </p>
                <Link
                    href="/activities"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined">explore</span>
                    {t("empty.action")}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
            ))}
        </div>
    );
}
