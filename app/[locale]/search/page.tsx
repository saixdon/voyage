"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { SearchBar } from "@/components/features/SearchBar";
import { ActivityCard } from "@/components/features/ActivityCard";
import { AISearchAssist } from "@/components/features/AISearchAssist";
import { parseSearchQuery, buildSearchParams } from "@/lib/utils/ai-query-parser";
import { Activity } from "@/types";
import { useLocale } from "next-intl";

import { Suspense } from "react";

interface SearchResult {
    source: "gyg" | "viator" | "mock";
    activities: Activity[];
    total: number;
    gygError?: string | null;
}

import { CATEGORY_MAPPING } from "@/lib/utils/categories";

const CATEGORY_FILTERS = [
    { id: "all", label: "All", icon: "apps", keywords: [] as string[] },
    ...CATEGORY_MAPPING.map(c => ({
        id: c.id,
        label: c.label,
        icon: c.icon,
        keywords: c.keywords
    }))
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
    const priceMinParam = searchParams.get("priceMin") || "";
    const priceMaxParam = searchParams.get("priceMax") || "";

    const [results, setResults] = useState<Activity[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [source, setSource] = useState<string>("");
    const [activeCategory, setActiveCategory] = useState(categoryParam);
    const [nextStart, setNextStart] = useState<number>(1);
    const [searchIntent, setSearchIntent] = useState<string | null>(null);
    const LIMIT = 20;

    // Function to fetch results
    const fetchResults = async (start: number, isNewSearch: boolean) => {
        setLoading(true);
        try {
            // Get locale from useLocale hook
            const currentLocale = typeof window !== 'undefined'
                ? window.location.pathname.split('/')[1]
                : 'en';

            let url = `/api/search?q=${encodeURIComponent(query)}&limit=${LIMIT}&start=${start}&locale=${currentLocale}`;
            if (dateFromParam) {
                url += `&from=${encodeURIComponent(dateFromParam)}`;
            }
            if (dateToParam) {
                url += `&to=${encodeURIComponent(dateToParam)}`;
            }
            if (priceMinParam) {
                url += `&priceMin=${encodeURIComponent(priceMinParam)}`;
            }
            if (priceMaxParam) {
                url += `&priceMax=${encodeURIComponent(priceMaxParam)}`;
            }

            // Add semantic filters if present
            const tags = searchParams.get("tags");
            const vibes = searchParams.get("vibes");
            const persona = searchParams.get("persona");
            if (tags) url += `&tags=${encodeURIComponent(tags)}`;
            if (vibes) url += `&vibes=${encodeURIComponent(vibes)}`;
            if (persona) url += `&persona=${encodeURIComponent(persona)}`;

            const response = await fetch(url);
            const data: SearchResult = await response.json();

            if (isNewSearch) {
                setResults(data.activities);
            } else {
                setResults(prev => [...prev, ...data.activities]);
            }

            setTotal(data.total);
            setSource(data.source);
            setNextStart(start + LIMIT);

        } catch (error) {
            console.error("Search error:", error);
            if (isNewSearch) {
                setResults([]);
                setTotal(0);
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch when params change
    useEffect(() => {
        setResults([]);
        setTotal(0);
        setNextStart(1);
        fetchResults(1, true); // Start at 1, isNewSearch = true
    }, [query, dateFromParam, dateToParam, priceMinParam, priceMaxParam, searchParams.get("tags"), searchParams.get("vibes"), searchParams.get("persona")]);

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

    const handleLoadMore = () => {
        fetchResults(nextStart, false);
    };

    // Handle AI Assist search - use DeepSeek for intelligent parsing
    const handleAISearch = async (aiQuery: string) => {
        setLoading(true);
        try {
            const currentQuery = rawQuery.trim();
            const combinedQuery = currentQuery ? `${currentQuery} ${aiQuery}` : aiQuery;

            // Call our new AI parsing API
            const response = await fetch('/api/ai/parse-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: combinedQuery,
                    locale: typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'de'
                })
            });

            if (!response.ok) throw new Error("AI parsing failed");

            const aiParsed = await response.json();
            console.log('DeepSeek Parsed:', aiParsed);
            if (aiParsed.intent) setSearchIntent(aiParsed.intent);

            // Map DeepSeek response to URL params
            const params = new URLSearchParams();

            // searchTerm from AI or original keywords
            const finalSearchTerm = aiParsed.searchTerm || aiParsed.location || combinedQuery;
            params.set('q', finalSearchTerm);

            if (aiParsed.priceMax) params.set('priceMax', String(aiParsed.priceMax));
            if (aiParsed.priceMin) params.set('priceMin', String(aiParsed.priceMin));
            if (aiParsed.durationMax) params.set('durationMax', String(aiParsed.durationMax));

            if (aiParsed.categories && Array.isArray(aiParsed.categories) && aiParsed.categories.length > 0) {
                params.set('categories', aiParsed.categories.join(','));
            }

            // Advanced semantic logics
            if (aiParsed.tags?.length) params.set('tags', aiParsed.tags.join(','));
            if (aiParsed.vibes?.length) params.set('vibes', aiParsed.vibes.join(','));
            if (aiParsed.travelerPersona) params.set('persona', aiParsed.travelerPersona);

            // Preserve dates if set
            if (dateFromParam) params.set('from', dateFromParam);
            if (dateToParam) params.set('to', dateToParam);

            router.push(`/search?${params.toString()}`);
        } catch (error) {
            console.error("AI Search Error, falling back to regex:", error);
            // Fallback to existing regex parser
            const combinedQuery = rawQuery.trim() ? `${rawQuery.trim()} ${aiQuery}` : aiQuery;
            const parsed = parseSearchQuery(combinedQuery);
            const params = buildSearchParams(parsed);
            if (dateFromParam) params.set('from', dateFromParam);
            if (dateToParam) params.set('to', dateToParam);
            router.push(`/search?${params.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header with search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-theme">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        {rawQuery ? `Results for "${rawQuery}"` : dateFromParam ? `Experiences matching your dates` : "Discover Experiences"}
                    </h1>

                    {/* AI Intent Highlight */}
                    {searchIntent && (
                        <div className="flex items-center gap-2 mb-3 animate-in fade-in slide-in-from-left-2 duration-500">
                            <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                            <span className="text-primary font-medium text-sm italic">"{searchIntent}"</span>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-base">
                        <span>{loading ? "Searching..." : `${filteredResults.length} experiences found`}</span>

                        {activeCategory !== "all" && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                {CATEGORY_FILTERS.find(c => c.id === activeCategory)?.label}
                            </span>
                        )}

                        {searchParams.get('persona') && (
                            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">person</span>
                                {searchParams.get('persona')}
                            </span>
                        )}

                        {(source === "viator" || source === "viator-api" || source === "mixed" || source === "database") && (
                            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium">
                                {source === "database" ? "Local Database" : source === "mixed" ? "Mixed Results" : "via Viator"}
                            </span>
                        )}
                    </div>
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
            <div className="mb-8">
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

            {/* AI Search Assist */}
            <div className="mb-10">
                <AISearchAssist onSearch={handleAISearch} isProcessing={loading} />
            </div>

            {/* Results grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {results.map((activity) => (
                    <ActivityCard key={activity.id} {...activity} />
                ))}

                {loading && [...Array(4)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="animate-pulse">
                        <div className="bg-surface-elevated rounded-2xl h-64 mb-4"></div>
                        <div className="bg-surface-elevated rounded h-4 w-3/4 mb-2"></div>
                        <div className="bg-surface-elevated rounded h-4 w-1/2"></div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && results.length === 0 && (
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

            {/* Load More Button */}
            {!loading && results.length > 0 && results.length < total && (
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-8 py-3 bg-surface border border-theme hover:bg-surface-elevated text-foreground font-medium rounded-full transition-colors flex items-center gap-2"
                    >
                        Load More Results
                        <span className="text-xs text-muted-foreground">({results.length} of {total})</span>
                    </button>
                </div>
            )}

            {/* Footer Branding */}
            {results.length > 0 && (source === 'viator-api' || source === 'mixed' || source === 'database') && (
                <div className="mt-16 text-center border-t border-theme pt-8">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        Powering your adventures
                        <span className="font-bold flex items-center gap-1.5">
                            via
                            <Image
                                src="/brand/viator-logo.svg"
                                alt="Viator"
                                width={60}
                                height={18}
                                className="inline-block"
                            />
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-6">
            <Suspense fallback={<div className="text-foreground text-center">Loading...</div>}>
                <SearchResults />
            </Suspense>
        </div>
    );
}
