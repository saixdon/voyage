"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/features/SearchBar";
import { ActivityCard } from "@/components/features/ActivityCard";
import { Activity } from "@/types";
import { useLocale } from "next-intl";

import { Suspense } from "react";

interface SearchResult {
    source: "gyg" | "viator" | "mock";
    activities: Activity[];
    total: number;
    gygError?: string | null;
}

// Category filter definitions
const CATEGORY_FILTERS = [
    { id: "all", label: "All", icon: "apps" },
    { id: "food", label: "Food & Drink", icon: "restaurant", keywords: ["food", "culinary", "wine", "beer", "cooking", "gastronomy", "tasting", "dinner", "lunch", "brunch", "restaurant"] },
    { id: "sport", label: "Sport & Outdoor", icon: "sports_soccer", keywords: ["sport", "hiking", "biking", "cycling", "climbing", "kayak", "surf", "ski", "golf", "adventure", "outdoor"] },
    { id: "culture", label: "Art & Culture", icon: "museum", keywords: ["museum", "art", "gallery", "history", "heritage", "architecture", "culture", "monument", "theater", "theatre", "church", "cathedral", "palace"] },
    { id: "nature", label: "Nature", icon: "park", keywords: ["nature", "park", "garden", "wildlife", "safari", "forest", "mountain", "lake", "beach", "waterfall", "eco"] },
    { id: "tours", label: "City Tours", icon: "location_city", keywords: ["city tour", "walking tour", "sightseeing", "hop-on", "bus tour", "guided tour"] },
    { id: "water", label: "Water Activities", icon: "sailing", keywords: ["boat", "cruise", "sailing", "snorkel", "diving", "swim", "water", "river", "canal", "yacht", "kayak", "paddle"] },
    { id: "transport", label: "Transport", icon: "directions_bus", keywords: ["transport", "transfer", "airport", "shuttle", "driver", "taxi", "pickup", "bus", "train", "limousine"] },
];

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawQuery = searchParams.get("q") || "";
    // Default to "activities" if no query provided to ensure we show something (like "All Activities")
    const query = rawQuery || "activities";
    const dateFromParam = searchParams.get("from") || "";
    const dateToParam = searchParams.get("to") || "";
    const categoryParam = searchParams.get("category") || "all";

    const [results, setResults] = useState<Activity[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [source, setSource] = useState<string>("");
    const [activeCategory, setActiveCategory] = useState(categoryParam);

    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            try {
                // If query is the default "activities", we might want to pass it or use a specific API param for "top rated"
                // For now, passing "activities" as q to the API is a reasonable fallback
                let url = `/api/search?q=${encodeURIComponent(query)}`;
                if (dateFromParam) {
                    url += `&from=${encodeURIComponent(dateFromParam)}`;
                }
                if (dateToParam) {
                    url += `&to=${encodeURIComponent(dateToParam)}`;
                }
                const response = await fetch(url);
                const data: SearchResult = await response.json();
                setResults(data.activities);
                setTotal(data.total);
                setSource(data.source);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query, dateFromParam, dateToParam]);

    // Update active category when URL param changes
    useEffect(() => {
        setActiveCategory(categoryParam);
    }, [categoryParam]);

    // Filter results based on selected category
    const filteredResults = useMemo(() => {
        if (activeCategory === "all") {
            return results;
        }

        const categoryConfig = CATEGORY_FILTERS.find(c => c.id === activeCategory);
        if (!categoryConfig || !categoryConfig.keywords) {
            return results;
        }

        return results.filter(activity => {
            const searchText = `${activity.title} ${activity.location}`.toLowerCase();
            return categoryConfig.keywords!.some(keyword => searchText.includes(keyword.toLowerCase()));
        });
    }, [results, activeCategory]);

    // Handle category click
    const handleCategoryClick = (categoryId: string) => {
        setActiveCategory(categoryId);
        // Update URL with category param
        const params = new URLSearchParams(searchParams.toString());
        if (categoryId === "all") {
            params.delete("category");
        } else {
            params.set("category", categoryId);
        }
        router.push(`/search?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header with search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 pb-8 border-b border-theme">
                <div>
                    <h1 className="text-5xl font-bold text-foreground mb-4">
                        {rawQuery ? `Results for "${rawQuery}"` : dateFromParam ? `Experiences matching your dates` : "Discover Experiences"}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {loading ? "Searching..." : `${filteredResults.length} experiences found`}
                        {activeCategory !== "all" && (
                            <span className="ml-2 text-sm bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                                {CATEGORY_FILTERS.find(c => c.id === activeCategory)?.label}
                            </span>
                        )}
                        {source === "viator" && (
                            <span className="ml-2 text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium">
                                via Viator
                            </span>
                        )}
                    </p>
                </div>
                <div className="w-full md:w-auto md:min-w-[450px]">
                    <SearchBar
                        initialValue={query}
                        initialDateFrom={dateFromParam}
                        initialDateTo={dateToParam}
                    />
                </div>
            </div>

            {/* Category filter chips */}
            <div className="mb-12">
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
                    {CATEGORY_FILTERS.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`flex shrink-0 items-center gap-2 h-11 px-5 rounded-full border transition-all duration-300 ${activeCategory === category.id
                                ? "bg-primary border-primary text-white"
                                : "bg-surface border-theme text-muted-foreground hover:border-primary/50 hover:bg-surface-elevated"
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {category.icon}
                            </span>
                            <span className="font-medium whitespace-nowrap text-sm">
                                {category.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Results grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-surface-elevated rounded-2xl h-64 mb-4"></div>
                            <div className="bg-surface-elevated rounded h-4 w-3/4 mb-2"></div>
                            <div className="bg-surface-elevated rounded h-4 w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                    {filteredResults.map((activity) => (
                        <ActivityCard key={activity.id} {...activity} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
                        search_off
                    </span>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                        No results found
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                        {activeCategory !== "all"
                            ? `No "${CATEGORY_FILTERS.find(c => c.id === activeCategory)?.label}" activities found. Try selecting "All" or a different category.`
                            : "We couldn't find any experiences matching your search. Try different keywords or dates."
                        }
                    </p>
                    {activeCategory !== "all" && (
                        <button
                            onClick={() => handleCategoryClick("all")}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
                        >
                            Show all results
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <Suspense fallback={<div className="text-foreground text-center">Loading...</div>}>
                <SearchResults />
            </Suspense>
        </div>
    );
}
