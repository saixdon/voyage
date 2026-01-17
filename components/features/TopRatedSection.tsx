"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { TransformedActivity } from "@/lib/api/viator-client";

interface ActivityWithBadge extends TransformedActivity {
    badge?: "bestseller" | "likely-to-sell-out" | "top-pick";
}

export function TopRatedSection() {
    const [activities, setActivities] = useState<ActivityWithBadge[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchActivities() {
            try {
                const res = await fetch("/api/activities/top-rated");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setActivities(data);
            } catch (error) {
                console.error("Error loading top rated activities", error);
            } finally {
                setLoading(false);
            }
        }
        fetchActivities();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (loading) {
        return (
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Attractions you can&apos;t miss</h2>
                        <p className="text-gray-400 mt-2">Top-rated experiences around the world</p>
                    </div>
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="min-w-[260px] aspect-[4/3] rounded-2xl bg-card-dark animate-pulse border border-white/5"
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (!activities.length) return null;

    return (
        <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Attractions you can&apos;t miss</h2>
                    <p className="text-gray-400 mt-2">Top-rated experiences around the world</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="size-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="size-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">arrow_forward</span>
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory"
            >
                {activities.slice(0, 8).map((activity, index) => (
                    <Link
                        key={activity.id}
                        href={`/activities/${activity.id}`}
                        className="relative min-w-[260px] md:min-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer flex-shrink-0 snap-start"
                    >
                        {/* Background Image */}
                        <img
                            src={activity.image}
                            alt={activity.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Rank Badge */}
                        <div className="absolute top-4 left-4 flex items-center justify-center w-8 h-8 bg-white text-slate-900 font-bold text-sm rounded-lg shadow-lg">
                            {index + 1}.
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                {activity.title}
                            </h3>
                            <p className="text-gray-300 text-sm">
                                {activity.reviewCount || Math.floor(Math.random() * 500) + 50} activities
                            </p>
                        </div>

                        {/* Hover Arrow */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-sm">
                                    arrow_forward
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
