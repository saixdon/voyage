"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/features/SearchBar";
import { ActivityCard } from "@/components/features/ActivityCard";
import { Activity } from "@/types";

import { Suspense } from "react";

interface SearchResult {
    source: "gyg" | "mock";
    activities: Activity[];
    total: number;
    gygError?: string | null;
}

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const [source, setSource] = useState<string>("");

    useEffect(() => {
        async function fetchResults() {
            if (!query) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data: SearchResult = await response.json();
                setResults(data.activities);
                setSource(data.source);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query]);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {query ? `Results for "${query}"` : "Discover Experiences"}
                    </h1>
                    <p className="text-gray-400">
                        {loading ? "Searching..." : `${results.length} experiences found`}
                        {source === "gyg" && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                via GetYourGuide
                            </span>
                        )}
                    </p>
                </div>
                <div className="w-full md:w-auto md:min-w-[400px]">
                    <SearchBar initialValue={query} />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-white/5 rounded-2xl h-64 mb-4"></div>
                            <div className="bg-white/5 rounded h-4 w-3/4 mb-2"></div>
                            <div className="bg-white/5 rounded h-4 w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {results.map((activity) => (
                        <ActivityCard key={activity.id} {...activity} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
                        search_off
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2">
                        No results found
                    </h3>
                    <p className="text-gray-400 max-w-md">
                        We couldn't find any experiences matching your search. Try different keywords or browse our top categories.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20 px-6">
            <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                <SearchResults />
            </Suspense>
        </div>
    );
}
