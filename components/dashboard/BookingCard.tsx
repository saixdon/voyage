"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations, useFormatter } from "next-intl";

// Define a type that matches the Prisma/Supabase structure we expect
// We can improve this with generated Prisma types later
interface BookingCardProps {
    booking: {
        id: string;
        status: string;
        travelDate: Date;
        totalPrice: number | null | any; // Type 'any' to avoid strict Decimal checks for now
        currency: string;
        product: {
            title: string;
            image?: string | null;
        };
    };
}

export default function BookingCard({ booking }: BookingCardProps) {
    const t = useTranslations("dashboard.bookings");
    const format = useFormatter();

    const statusColor = {
        CONFIRMED: "bg-green-500/20 text-green-500",
        PENDING: "bg-yellow-500/20 text-yellow-500",
        CANCELLED: "bg-red-500/20 text-red-500",
        dec: "bg-primary/20 text-primary" // default
    };

    const statusKey = booking.status as keyof typeof statusColor;
    const badgeClass = statusColor[statusKey] || statusColor.dec;

    return (
        <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors group">
            <div className="flex flex-col sm:flex-row gap-4 p-4">
                {/* Image */}
                <div className="w-full sm:w-32 h-24 relative rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {booking.product.image ? (
                        <Image
                            src={booking.product.image}
                            alt={booking.product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <span className="material-symbols-outlined">image</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-bold text-foreground truncate pr-2">
                                {booking.product.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">calendar_today</span>
                                {format.dateTime(new Date(booking.travelDate), {
                                    dateStyle: "medium",
                                })}
                            </p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
                            {booking.status}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                            {booking.totalPrice
                                ? format.number(Number(booking.totalPrice), {
                                    style: "currency",
                                    currency: booking.currency || "EUR",
                                })
                                : "Free"}
                        </div>
                        <Link
                            href={`/account/bookings/${booking.id}`}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                            Details
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
