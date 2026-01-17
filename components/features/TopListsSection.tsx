"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TransformedTag, TrendingDestination } from "@/lib/api/viator-client";

type Tab = "attractions" | "destinations" | "countries" | "categories";

interface TopListProps {
    className?: string;
}

export function TopListsSection({ className = "" }: TopListProps) {
    const [activeTab, setActiveTab] = useState<Tab>("destinations");
    const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
    const [categories, setCategories] = useState<TransformedTag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch destinations
                const destRes = await fetch("/api/viator/destinations/trending");
                if (destRes.ok) {
                    const data = await destRes.json();
                    if (data.success && data.destinations) {
                        setDestinations(data.destinations);
                    }
                }

                // Fetch categories
                const catRes = await fetch("/api/viator/tags");
                if (catRes.ok) {
                    const data = await catRes.json();
                    if (data.success && data.categories) {
                        setCategories(data.categories);
                    }
                }
            } catch (error) {
                console.error("Failed to load top lists data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Derived data for different tabs
    const topCountries = React.useMemo(() => {
        const uniqueCountries = new Set<string>();
        const countries: { name: string; count: number }[] = [];

        destinations.forEach(d => {
            if (!uniqueCountries.has(d.country)) {
                uniqueCountries.add(d.country);
                countries.push({ name: d.country, count: Math.floor(Math.random() * 50) + 10 }); // Mock count
            }
        });
        return countries;
    }, [destinations]);

    const topAttractions = React.useMemo(() => {
        return destinations.map(d => ({
            name: d.highlightActivity?.name || `Tour in ${d.name}`,
            location: d.name,
            rating: d.highlightActivity?.rating || 4.5,
            reviews: Math.floor(Math.random() * 2000) + 100
        })).sort((a, b) => b.reviews - a.reviews);
    }, [destinations]);

    return (
        <section className={`w-full bg-[#050505] py-16 px-6 border-t border-white/5 ${className}`}>
            <div className="max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-8 border-b border-white/10 mb-10 overflow-x-auto hide-scrollbar">
                    <button
                        onClick={() => setActiveTab("attractions")}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === "attractions" ? "text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Top attractions worldwide
                        {activeTab === "attractions" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(43,140,238,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("destinations")}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === "destinations" ? "text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Top destinations
                        {activeTab === "destinations" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(43,140,238,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("countries")}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === "countries" ? "text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Top countries to visit
                        {activeTab === "countries" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(43,140,238,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === "categories" ? "text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Top attraction categories
                        {activeTab === "categories" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(43,140,238,0.5)]" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {activeTab === "attractions" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {topAttractions.map((attr, idx) => (
                                        <div key={idx} className="group cursor-pointer">
                                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                                <span className="text-gray-500 font-bold text-lg min-w-[1.5rem]">{idx + 1}.</span>
                                                <div>
                                                    <h3 className="text-white font-bold mb-1 group-hover:text-primary transition-colors">{attr.name}</h3>
                                                    <p className="text-sm text-gray-400 mb-1">{attr.reviews} tours & activities</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "destinations" && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {destinations.map((dest, idx) => (
                                        <Link
                                            key={dest.id}
                                            href={`/search?q=${encodeURIComponent(dest.query)}`}
                                            className="group block"
                                        >
                                            <div className="p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors">{dest.name}</h3>
                                                <p className="text-sm text-gray-400">{Math.floor(Math.random() * 1000) + 500} tours & activities</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {activeTab === "countries" && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {topCountries.map((country, idx) => (
                                        <Link
                                            key={country.name}
                                            href={`/search?q=${encodeURIComponent(country.name)}`}
                                            className="group block"
                                        >
                                            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                                <span className="text-gray-500 font-bold min-w-[1.5rem]">{idx + 1}.</span>
                                                <h3 className="text-white font-bold group-hover:text-primary transition-colors">{country.name}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {activeTab === "categories" && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {categories.map((cat, idx) => (
                                        <Link
                                            key={cat.id}
                                            href={`/search?q=${encodeURIComponent(cat.query)}&tagId=${cat.id}`}
                                            className="group block"
                                        >
                                            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                                <span className="text-gray-500 font-bold min-w-[1.5rem]">{idx + 1}.</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-lg">{cat.icon}</span>
                                                    <h3 className="text-white font-medium group-hover:text-primary transition-colors">{cat.name}</h3>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
