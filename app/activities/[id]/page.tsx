"use client";

import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { notFound } from "next/navigation";
import type { TransformedActivity } from "@/lib/api/viator-client";

interface ActivityWithBadge extends TransformedActivity {
    badge?: string;
}

export default function ActivityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [activity, setActivity] = useState<ActivityWithBadge | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchActivity() {
            try {
                // Fetch activity details from Viator API
                const response = await fetch(`/api/activity/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setError("Activity not found");
                    } else {
                        setError("Failed to load activity");
                    }
                    return;
                }
                const data = await response.json();
                setActivity(data);
            } catch (err) {
                setError("Failed to load activity");
            } finally {
                setLoading(false);
            }
        }
        fetchActivity();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !activity) {
        notFound();
        return null;
    }

    return (
        <div className="min-h-screen bg-background-dark pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full min-h-[400px]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-black/40 z-10" />
                    <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
                    <div className="max-w-3xl">
                        {activity.badge && (
                            <span className="inline-block bg-primary px-4 py-1 rounded-lg text-sm font-bold text-white mb-4 animate-fade-in-up">
                                {activity.badge.replace(/-/g, " ").toUpperCase()}
                            </span>
                        )}
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                            {activity.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/80 animate-fade-in-up-delay-1">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                <span>{activity.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                <span>{activity.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-yellow-400">
                                <span className="material-symbols-outlined">star</span>
                                <span className="font-bold">{activity.rating}</span>
                                <span className="text-white/60">({activity.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="bg-card-dark border border-white/5 p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold text-white mb-6">About this experience</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">confirmation_number</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Free Cancellation</h4>
                                    <p className="text-sm text-gray-400 mt-1">Cancel up to 24 hours in advance for a full refund</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">electric_bolt</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Instant confirmation</h4>
                                    <p className="text-sm text-gray-400 mt-1">Get your tickets instantly via email</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">smartphone</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Mobile ticketing</h4>
                                    <p className="text-sm text-gray-400 mt-1">Use your phone or print your voucher</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">translate</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Live tour guide</h4>
                                    <p className="text-sm text-gray-400 mt-1">English, German, Spanish, Italian, French</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Experience highlights</h2>
                        <ul className="space-y-4">
                            {[
                                "Skip the long lines with priority access",
                                "Learn about the history from an expert local guide",
                                "Explore the hidden paths and secret stories",
                                "Perfect for first-time visitors and history enthusiasts"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Right Column - Booking Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-32 bg-card-dark border border-white/10 p-8 rounded-3xl shadow-2xl glass-strong">
                        <div className="mb-8">
                            <span className="text-gray-400 text-sm">Price starts from</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-white">{activity.currency}{activity.price}</span>
                                <span className="text-gray-500">per person</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                                    <div>
                                        <p className="text-xs text-gray-400">Select Date</p>
                                        <p className="text-sm font-bold text-white">Choose a date</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-500">keyboard_arrow_down</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">group</span>
                                    <div>
                                        <p className="text-xs text-gray-400">Participants</p>
                                        <p className="text-sm font-bold text-white">2 Adults</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-500">keyboard_arrow_down</span>
                            </div>
                        </div>

                        <Button size="lg" className="w-full text-lg h-14">
                            Check availability
                        </Button>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            No hidden fees • Instant Confirmation
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
