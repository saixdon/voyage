"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/features/SearchBar";
import { TopRatedSection } from "@/components/features/TopRatedSection";

interface Category {
    id: number;
    name: string;
    icon: string;
    query: string;
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // Fetch categories from API on mount
    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await fetch("/api/viator/tags?locale=en");
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.categories?.length > 0) {
                        setCategories(data.categories);
                    }
                }
            } catch (error) {
                console.error("Failed to load categories:", error);
                // Keep default categories on error
            } finally {
                setIsLoadingCategories(false);
            }
        }
        loadCategories();
    }, []);
    return (
        <>
            {/* Hero Section */}
            <div className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background-dark z-10"></div>
                    <img
                        alt="Scenic view of mountains and lake with a boat in Switzerland"
                        className="w-full h-full object-cover"
                        src="/swiss_alps_hero.png"
                    />
                </div>
                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center max-w-4xl px-4 text-center mt-10">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-none mb-6 text-glow opacity-0 animate-fade-in-up">
                        DISCOVER THE
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">
                            UNSEEN
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-10 opacity-0 animate-fade-in-up-delay-1 font-light">
                        Unforgettable experiences at your fingertips. Book tours,
                        activities, and attractions anywhere in the world.
                    </p>
                    {/* Search Bar */}
                    <div className="w-full mt-4 flex justify-center opacity-0 animate-fade-in-up-delay-2">
                        <SearchBar />
                    </div>
                    {/* Quick Stats/Trust */}
                    <div className="mt-12 flex gap-8 md:gap-16 opacity-0 animate-fade-in-up-delay-2">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">50K+</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                Experiences
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">160+</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                Countries
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">4.8/5</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                User Rating
                            </p>
                        </div>
                    </div>
                </div>
                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-70">
                    <span className="material-symbols-outlined text-white text-3xl">
                        keyboard_arrow_down
                    </span>
                </div>
            </div>

            {/* Main Content Container */}
            <main className="max-w-7xl mx-auto px-6 py-20">
                {/* Categories / Chips */}
                <section className="mb-20">
                    <h3 className="text-white/60 text-sm font-medium uppercase tracking-widest mb-6">
                        Browse by Category
                    </h3>
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                        {isLoadingCategories ? (
                            // Loading skeleton
                            [...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex shrink-0 items-center gap-3 h-14 px-6 rounded-2xl bg-card-dark border border-white/5 animate-pulse"
                                >
                                    <div className="w-6 h-6 rounded bg-white/10"></div>
                                    <div className="w-20 h-4 rounded bg-white/10"></div>
                                </div>
                            ))
                        ) : (
                            categories.map((category) => (
                                <Link
                                    key={category.id}
                                    className="flex shrink-0 items-center gap-3 h-14 px-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 hover:bg-card-hover transition-all duration-300 group"
                                    href={`/search?q=${encodeURIComponent(category.query)}`}
                                >
                                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                                        {category.icon}
                                    </span>
                                    <span className="text-white font-medium whitespace-nowrap">
                                        {category.name}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* Trending Destinations */}
                <section className="mb-24">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Trending Destinations
                            </h2>
                            <p className="text-gray-400">
                                Most popular places traveled by our community
                            </p>
                        </div>
                        <a
                            className="hidden md:flex items-center gap-1 text-primary hover:text-white transition-colors font-medium group"
                            href="#"
                        >
                            View all
                            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                                arrow_forward
                            </span>
                        </a>
                    </div>
                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Large Card - Rome */}
                        <Link href="/search?q=Rome" className="relative md:col-span-2 md:row-span-2 group overflow-hidden rounded-3xl cursor-pointer block">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                            <img
                                alt="Ancient Roman architecture in Rome, Italy during sunset"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1AjHuGxBbevjUBWBcJQ5CyII45U8ouI_ZNeOFKGpbDo1JbzLhJ8EMGdcdMhgwfFSOwKVKx6A4FggkIy0KLL2upxmYjdKEtFMtpdmAlps3yfLY7Awy2yDEoXXMNABWE8aaX6w9qAo6EAHARA3lrUVCqU-52pK8D3In6jnbFB7AOqUBlGwcoBJaZPVXoxe0OB5ES-vdEvrUOzLfCxPnvsAKnadPR5heVQfo2eK2ihEXw7R6D0JT29d9BkVJaBCJOMXGdGL9Glkdue8T"
                            />
                            <div className="absolute bottom-0 left-0 p-8 z-30 w-full">
                                <div className="flex justify-between items-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <div>
                                        <h3 className="text-4xl font-bold text-white mb-2">Rome</h3>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <span className="material-symbols-outlined text-primary text-sm">
                                                location_on
                                            </span>
                                            <span>Italy</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20">
                                            Explore Tours
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        {/* Tall Card - Paris */}
                        <Link href="/search?q=Paris" className="relative md:col-span-1 md:row-span-2 group overflow-hidden rounded-3xl cursor-pointer block">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                            <img
                                alt="Eiffel Tower view from a street in Paris, France"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA42_x_NJKZ3NPmOSGnKRtxxxlKjqPR1lM6r4_yv8FBoQFXEI32ij0Ge15c3fL0lmob4utP6JsYuKESTPuwdxwLL7UmESH0_c-nqXobs71zaCQ6XmcfSHe2ySOV8DgSpBZa2PNQ8ZF6hkMK0szLUVFEQFk7Gx8E6TfK4m3fx5yC59QnQDsqblLdyXNsEIDP2YDTRoih3KqhbJFrQDIAFaLx3XFsCn8kudL4uEMr3iIETY54zoimjtDwFv9FxKLYO9mu6R6L5vXthByb"
                            />
                            <div className="absolute bottom-0 left-0 p-6 z-30 w-full">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-3xl font-bold text-white mb-1">Paris</h3>
                                    <div className="flex items-center gap-2 text-gray-300 mb-4">
                                        <span className="material-symbols-outlined text-primary text-sm">
                                            location_on
                                        </span>
                                        <span>France</span>
                                    </div>
                                    <span className="inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-sm text-primary font-medium">
                                        Explore Activities →
                                    </span>
                                </div>
                            </div>
                        </Link>
                        {/* Regular Card - Barcelona */}
                        <Link href="/search?q=Barcelona" className="relative group overflow-hidden rounded-3xl cursor-pointer block">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                            <img
                                alt="Colorful architecture and streets in Barcelona, Spain"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUMn1vzToK6c-BU8uLhEmxpQSo_XWFd6Y8vfNF-Jm4vjsTEOSzWXh6FSh1AtynHOiPqYnSP_5v9q9YCotgxaXfNJHpSHUC3RtoCnw9uJ_V-tWz4FEJHCb79wkn0eAs-ZlaTiyxo1faQRZN0mn2KEswOLfoRarkJUllq6f0FBxz6BVQwOKUEsjInfIQL0OQGsdp1JRJ2G4orT4QMF5wYojUJlgrlhYxgnBKRE3oeO1Tb07Q9saXQe9OBcJhUVnW2A0WOZRP8NO5LKHQ"
                            />
                            <div className="absolute bottom-0 left-0 p-6 z-30 w-full">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-2xl font-bold text-white">Barcelona</h3>
                                    <p className="text-gray-300 text-sm">Spain</p>
                                </div>
                            </div>
                        </Link>
                        {/* Regular Card - New York */}
                        <Link href="/search?q=New%20York" className="relative group overflow-hidden rounded-3xl cursor-pointer md:col-span-2 block">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                            <img
                                alt="Skyline of New York City, USA during daytime"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1qfrwqE84IJy1QbWT2hUAjBIxKI4BU1cSjYurt1uCo0nQVpEuAwOC_1YEE6KVJ-KYTDQp2XGp30_TU1Yy_gFKbRO1vDNu6-eWABTWL2ZmJ59OehHK61ni7noNJgf5xyWSLSVqCgBEGuo-h0YMs6iLfWfxkV_gk23Gbegv59zTrji4envRdpB8zEGhjeci0H-YLUhgAluO0wFK1VP2VShLduLeZSlqmCcY_IKv3QWF8tEtnqWPHQ5pkq26LocnSovB1KdhL_79Q7Z1"
                            />
                            <div className="absolute bottom-0 left-0 p-6 z-30 w-full flex justify-between items-end">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-2xl font-bold text-white">New York</h3>
                                    <p className="text-gray-300 text-sm">USA</p>
                                </div>
                                <div className="transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                    <span className="material-symbols-outlined text-white bg-primary p-2 rounded-full">
                                        arrow_forward
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Top Experiences Carousel */}
                <TopRatedSection />

                {/* Newsletter / CTA Section */}
                <section className="relative rounded-3xl overflow-hidden bg-card-dark border border-white/5 py-16 px-6 md:px-20 text-center">
                    {/* Abstract background blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">
                                mail
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Your travel journey starts here
                        </h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Sign up to receive travel inspiration, exclusive offers, and tips
                            for your next adventure.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3">
                            <input
                                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="Your email address"
                                type="email"
                            />
                            <button
                                className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(43,140,238,0.3)] hover:shadow-[0_0_30px_rgba(43,140,238,0.5)] transition-all transform hover:scale-105"
                                type="button"
                            >
                                Subscribe
                            </button>
                        </form>
                        <p className="text-gray-500 text-xs mt-4">
                            By signing up, you agree to receive promotional emails. You can
                            unsubscribe at any time.
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
