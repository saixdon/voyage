"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { HeroSearchContainer } from "@/components/features/HeroSearchContainer";
import { AIPlannerResults } from "@/components/features/AIPlannerResults";
import { TopRatedSection } from "@/components/features/TopRatedSection";
import { TopListsSection } from "@/components/features/TopListsSection";
import { FAQSection } from "@/components/features/FAQSection";
import { LandingBackground } from "@/components/features/LandingBackground";
import { ActivityMap } from "@/components/features/ActivityMap";
import { HeroActivityAnimation } from "@/components/features/HeroActivityAnimation";
import { generateTripPlanAction, type TripPlanResponse, type TripPlanRequest } from "@/app/actions/ai-planner";

interface TrendingDestination {
    id: number;
    name: string;
    country: string;
    image: string;
    query: string;
}

export default function HomePage() {
    const heroT = useTranslations('hero');
    const statsT = useTranslations('stats');
    const trustT = useTranslations('trust');
    const homeT = useTranslations('home');

    const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
    const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);

    const handleAiPlanRequest = () => {
        // Now handled by redirect in HeroSearchContainer
    };

    // Fetch data on mount
    useEffect(() => {
        async function loadData() {
            // Fetch destinations
            try {
                const destRes = await fetch("/api/viator/destinations/trending");
                if (destRes.ok) {
                    const data = await destRes.json();
                    if (data.success && data.destinations?.length > 0) {
                        setDestinations(data.destinations);
                    }
                }
            } catch (error) {
                console.error("Failed to load destinations:", error);
            } finally {
                setIsLoadingDestinations(false);
            }
        }
        loadData();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <div className="relative w-full min-h-screen flex flex-col items-center pt-[12vh] md:pt-[15vh]">
                {/* Background Animation (Auto, Smooth) */}
                <HeroActivityAnimation />

                {/* Content Overlay */}
                <div className="relative z-40 flex flex-col items-center max-w-5xl px-4 text-center w-full font-sans">
                    <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-none mb-4 md:mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] opacity-0 animate-fade-in-up">
                        {heroT('title1')}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                            {heroT('title2')}
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] max-w-2xl mb-10 opacity-0 animate-fade-in-up-delay-1 font-medium">
                        {heroT('subtitle')}
                    </p>

                    {/* Hero Search Container (Toggle AI/Classic) */}
                    <HeroSearchContainer />

                    {/* Quick Stats/Trust */}
                    <div className="mt-16 flex gap-8 md:gap-16 opacity-0 animate-fade-in-up-delay-3">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">50K+</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                {statsT('experiences')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">160+</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                {statsT('countries')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">4.8/5</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                {statsT('rating')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-70 z-40">
                    <span className="material-symbols-outlined text-white text-3xl">
                        keyboard_arrow_down
                    </span>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="relative w-full">
                <LandingBackground />
                <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

                    {/* Trust Badges Section (Moved) */}
                    {/* Trust Badges Section (Viator Style) */}
                    <section className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                Why book with TripVega?
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
                            {[
                                {
                                    icon: "support_agent",
                                    title: "24/7 customer support",
                                    desc: "No matter the time zone, we're here to help.",
                                    color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                },
                                {
                                    icon: "verified",
                                    title: "Earn rewards",
                                    desc: "Explore, earn, redeem, and repeat with our loyalty program.",
                                    color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                                },
                                {
                                    icon: "reviews",
                                    title: "Millions of reviews",
                                    desc: "Plan and book with confidence using reviews from fellow travelers.",
                                    color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                },
                                {
                                    icon: "calendar_month",
                                    title: "Plan your way",
                                    desc: "Stay flexible with free cancellation and the option to reserve now and pay later.",
                                    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                },
                            ].map((badge, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center group">
                                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${badge.color}`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {badge.icon}
                                        </span>
                                    </div>
                                    <h3 className="text-foreground font-bold text-lg mb-2">{badge.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px]">{badge.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>


                    {/* Trending Destinations */}
                    <section className="mb-24">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                    {homeT('trendingTitle')}
                                </h2>
                                <p className="text-muted-foreground">
                                    {homeT('trendingSubtitle')}
                                </p>
                            </div>
                            <Link
                                className="hidden md:flex items-center gap-1 text-primary hover:text-foreground transition-colors font-medium group"
                                href="/search?q=popular"
                            >
                                {homeT('viewAll')}
                                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                                    arrow_forward
                                </span>
                            </Link>
                        </div>

                        {/* Bento Grid Layout - Dynamic or Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                            {isLoadingDestinations ? (
                                // Loading skeletons for bento grid
                                <>
                                    <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-surface animate-pulse border border-theme" />
                                    <div className="md:col-span-1 md:row-span-2 rounded-3xl bg-surface animate-pulse border border-theme" />
                                    <div className="rounded-3xl bg-surface animate-pulse border border-theme" />
                                    <div className="md:col-span-2 rounded-3xl bg-surface animate-pulse border border-theme" />
                                </>
                            ) : (
                                destinations.map((dest, index) => {
                                    // Designate different grid spans for bento effect
                                    let gridClass = "relative group overflow-hidden rounded-3xl cursor-pointer block";
                                    if (index === 0) gridClass += " md:col-span-2 md:row-span-2";
                                    else if (index === 1) gridClass += " md:col-span-1 md:row-span-2";
                                    else if (index === 3) gridClass += " md:col-span-2";

                                    return (
                                        <Link
                                            key={dest.id}
                                            href={`/search?q=${encodeURIComponent(dest.query)}`}
                                            className={gridClass}
                                        >
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                                            <img
                                                alt={`${dest.name} in ${dest.country}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                src={dest.image}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"; // Fallback: Beautiful Alps/Mountains
                                                }}
                                            />
                                            <div className="absolute bottom-0 left-0 p-8 z-30 w-full">
                                                <div className="flex justify-between items-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                    <div>
                                                        <h3 className={`${index < 2 ? 'text-4xl' : 'text-3xl'} font-bold text-white mb-2`}>{dest.name}</h3>
                                                        <div className="flex items-center gap-2 text-gray-300">
                                                            <span className="material-symbols-outlined text-primary text-sm">
                                                                location_on
                                                            </span>
                                                            <span>{dest.country}</span>
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20">
                                                            {homeT('explore')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* Top Experiences Carousel */}
                    <TopRatedSection />

                    {/* Top Lists Section (Luxury Design) */}
                    <TopListsSection />

                    {/* FAQ Section */}
                    <FAQSection />

                    {/* Newsletter / CTA Section */}
                    <section className="relative rounded-3xl overflow-hidden bg-surface border border-theme py-16 px-6 md:px-20 text-center">
                        {/* Abstract background blobs */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl">
                                    mail
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                                {homeT('newsletterTitle')}
                            </h2>
                            <p className="text-muted-foreground mb-8 text-lg">
                                {homeT('newsletterSubtitle')}
                            </p>
                            <NewsletterForm t={homeT} />
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

function NewsletterForm({ t }: { t: any }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "loading">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus("loading");

        // Mock API call
        setTimeout(() => {
            console.log("Newsletter subscription for:", email);
            setStatus("success");
            setEmail("");
            // Reset status after 3 seconds
            setTimeout(() => setStatus("idle"), 3000);
        }, 1000);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    className="flex-1 bg-surface-elevated border border-theme rounded-xl px-5 py-4 text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder={t('emailPlaceholder')}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button
                    className={`bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(43,140,238,0.3)] hover:shadow-[0_0_30px_rgba(43,140,238,0.5)] transition-all transform hover:scale-105 disabled:opacity-70 disabled:pointer-events-none`}
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                >
                    {status === "loading" ? "..." : status === "success" ? "✓" : t('subscribeParams').split(' ')[0] === 'Mit' ? 'Abonnieren' : 'Subscribe'}
                </button>
            </form>
            <p className="text-muted-foreground text-xs mt-4">
                {t('subscribeParams')}
            </p>
        </>
    );
}

