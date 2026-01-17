"use client";

import React, { useEffect, useState } from "react";
import { ActivityCard } from "./ActivityCard";
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
            const scrollAmount = 340; // Approx card width
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
                    <h2 className="text-3xl font-bold text-white">Top Rated Experiences</h2>
                </div>
                <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[300px] md:min-w-[340px] aspect-[4/5] rounded-2xl bg-card-dark animate-pulse border border-white/5" />
                    ))}
                </div>
            </section>
        );
    }

    if (!activities.length) return null;

    return (
        <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Top Rated Experiences</h2>
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
                className="flex gap-6 overflow-x-auto hide-scrollbar pb-10 snap-x snap-mandatory"
            >
                {activities.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        {...activity}
                    />
                ))}
            </div>
        </section>
    );
}
