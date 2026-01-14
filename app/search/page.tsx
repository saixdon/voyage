"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/features/SearchBar";
import { ActivityCard } from "@/components/features/ActivityCard";
import { MOCK_ACTIVITIES } from "@/lib/api/mockData";
import { Activity } from "@/types";

import { Suspense } from "react";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState<Activity[]>([]);

    useEffect(() => {
        // Basic filter logic to simulate API search
        const filtered = MOCK_ACTIVITIES.filter(
            (activity) =>
                activity.title.toLowerCase().includes(query.toLowerCase()) ||
                activity.location.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
    }, [query]);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {query ? `Results for "${query}"` : "Discover Experiences"}
                    </h1>
                    <p className="text-gray-400">
                        {results.length} experiences found
                    </p>
                </div>
                <div className="w-full md:w-auto md:min-w-[400px]">
                    <SearchBar initialValue={query} />
                </div>
            </div>

            {results.length > 0 ? (
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
