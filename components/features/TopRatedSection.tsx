"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Star, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import type { TransformedActivity } from "@/lib/api/viator-client";

interface ActivityWithBadge extends TransformedActivity {
    badge?: string;
}

export function TopRatedSection() {
    const t = useTranslations('topRated');
    const locale = useLocale();
    const [activities, setActivities] = useState<ActivityWithBadge[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchActivities() {
            try {
                const res = await fetch(`/api/activities/top-rated?locale=${locale}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                // Filter out Scavenger Hunts as per user request (uninspiring content)
                const filteredData = Array.isArray(data)
                    ? data.filter((item: any) => !item.title.toLowerCase().includes("scavenger hunt"))
                    : [];
                setActivities(filteredData);
            } catch (error) {
                console.error("Error loading top rated activities", error);
            } finally {
                setLoading(false);
            }
        }
        fetchActivities();
    }, [locale]);

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
                        <h2 className="text-3xl font-bold text-foreground">{t('title')}</h2>
                        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
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
                    <h2 className="text-3xl font-bold text-foreground">{t('title')}</h2>
                    <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="size-10 rounded-full border border-theme flex items-center justify-center hover:bg-surface-elevated transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="size-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>


            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory"
            >
                {activities.slice(0, 12).map((activity, index) => (
                    <Link
                        key={`${activity.id}-${index}`}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Badges Container */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {/* Rank Badge */}
                            <div className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm text-slate-900 font-bold text-sm rounded-lg shadow-lg">
                                {index + 1}.
                            </div>

                            {/* Special Badge (Bestseller etc) */}
                            {activity.badge && (
                                <div className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg shadow-lg uppercase tracking-wider">
                                    {activity.badge}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                {activity.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center p-1 bg-black/40 backdrop-blur-md rounded-md">
                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-white text-xs font-bold ml-1">{activity.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-gray-400 text-xs">•</span>
                                <p className="text-gray-300 text-xs">
                                    {activity.reviewCount > 0 ? activity.reviewCount : 0} {t('reviews')}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-white/80 text-xs">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[200px]">{activity.location}</span>
                            </div>
                        </div>

                        {/* Hover Arrow */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

