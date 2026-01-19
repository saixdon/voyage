"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Globe, ArrowRight, ChevronRight, Sparkles, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingDestination, TransformedTag } from "@/lib/api/viator-client";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "attractions" | "destinations" | "countries" | "categories";

interface TopListProps {
    className?: string;
}

export function TopListsSection({ className = "" }: TopListProps) {
    const t = useTranslations('topLists');
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState<Tab>("attractions");
    const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
    const [categories, setCategories] = useState<TransformedTag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const destRes = await fetch(`/api/viator/destinations/trending?locale=${locale}`);
                if (destRes.ok) {
                    const data = await destRes.json();
                    if (data.success && data.destinations) {
                        setDestinations(data.destinations);
                    }
                }

                const catRes = await fetch(`/api/viator/tags?locale=${locale}`);
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
    }, [locale]);

    const topCountries = useMemo(() => {
        const uniqueCountries = new Set<string>();
        const countries: { name: string; count: number }[] = [];

        destinations.forEach(d => {
            if (!uniqueCountries.has(d.country)) {
                uniqueCountries.add(d.country);
                countries.push({ name: d.country, count: Math.floor(Math.random() * 50) + 10 });
            }
        });
        return countries;
    }, [destinations]);

    const topAttractions = useMemo(() => {
        return destinations.map(d => ({
            name: (d as any).highlightActivity?.name || `Exclusive Tour in ${d.name}`,
            location: d.name,
            reviews: Math.floor(Math.random() * 2000) + 100
        })).sort((a, b) => b.reviews - a.reviews);
    }, [destinations]);

    const tabs: { id: Tab; label: string }[] = [
        { id: "attractions", label: t('attractions') },
        { id: "destinations", label: t('destinations') },
        { id: "countries", label: t('countries') },
        { id: "categories", label: t('categories') },
    ];

    const containerVariants: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
        show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <section className={cn("w-full py-32 px-6 relative overflow-hidden bg-black", className)}>
            {/* --- COSMIC BACKGROUND --- */}
            <StarBackground />

            {/* Ambient Ambient Glows */}
            <div className="absolute top-1/4 -left-24 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] opacity-30 pointer-events-none" />
            <div className="absolute bottom-1/4 -right-24 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[160px] opacity-30 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-20 gap-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6 max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.2em] uppercase">
                            <Sparkles className="w-3.5 h-3.5" />
                            Premium Concierge Curations
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-500">Next Story</span>
                        </h2>
                        <p className="text-gray-400 text-lg font-light leading-relaxed max-w-xl">
                            Our editors have hand-picked the world's most breathtaking experiences. From hidden gems to legendary landmarks.
                        </p>
                    </motion.div>

                    {/* Highly Visual Map CTA Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="relative group lg:max-w-sm w-full"
                    >
                        <Link href="/destinations" className="block relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-3xl transition-all duration-500 hover:border-primary/50">
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700">
                                <Globe className="w-24 h-24 text-primary" />
                            </div>
                            <div className="relative z-20">
                                <div className="p-3 bg-primary/20 rounded-2xl w-fit mb-6 shadow-[0_0_20px_rgba(43,140,238,0.3)]">
                                    <MapIcon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Interactive Map</h3>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Visualize all exclusive destinations and tours on our high-performance 3D interface.</p>
                                <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest group-hover:gap-4 transition-all uppercase">
                                    {t('viewOnMap')} <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Tab Navigation - Ultra-Clean Floating Pill */}
                <div className="flex flex-wrap items-center gap-1.5 mb-16 p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] w-fit mx-auto lg:mx-0 shadow-2xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-8 py-3.5 rounded-[2.5rem] text-xs font-black tracking-widest uppercase transition-all duration-500 relative overflow-hidden",
                                activeTab === tab.id
                                    ? "text-white"
                                    : "text-gray-500 hover:text-white"
                            )}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabPill"
                                    className="absolute inset-0 bg-primary shadow-[0_0_25px_rgba(43,140,238,0.4)] z-0"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Smooth Content Transition Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1"
                    >
                        {activeTab === "attractions" && topAttractions.map((attr, idx) => (
                            <ListItemListItem
                                key={idx}
                                variants={itemVariants}
                                title={attr.name}
                                subtitle={`${attr.reviews} ${t('toursActivities')}`}
                                href={`/search?q=${encodeURIComponent(attr.location)}`}
                            />
                        ))}

                        {activeTab === "destinations" && destinations.map((dest) => (
                            <ListItemListItem
                                key={dest.id}
                                variants={itemVariants}
                                title={dest.name}
                                subtitle={`${Math.floor(Math.random() * 800) + 200} ${t('toursActivities')}`}
                                href={`/search?q=${encodeURIComponent(dest.query)}`}
                            />
                        ))}

                        {activeTab === "countries" && topCountries.map((country) => (
                            <ListItemListItem
                                key={country.name}
                                variants={itemVariants}
                                title={country.name}
                                subtitle={`${country.count} destinations`}
                                href={`/search?q=${encodeURIComponent(country.name)}`}
                            />
                        ))}

                        {activeTab === "categories" && categories.slice(0, 15).map((cat) => (
                            <ListItemListItem
                                key={cat.id}
                                variants={itemVariants}
                                title={cat.name}
                                subtitle={t('toursActivities')}
                                href={`/search?q=${encodeURIComponent(cat.query)}&tagId=${cat.id}`}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}

const ListItemListItem = motion(function ListItem({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center justify-between py-6 px-4 rounded-[1.5rem] transition-all duration-500 hover:bg-white/[0.03] border-b border-white/[0.03] hover:border-white/10"
        >
            <div className="flex flex-col gap-1.5">
                <h3 className="text-gray-100 font-bold text-lg leading-tight group-hover:text-primary transition-colors duration-500 capitalize">
                    {title.toLowerCase()}
                </h3>
                <div className="flex items-center gap-3">
                    <div className="h-px w-6 bg-gray-800 group-hover:w-10 group-hover:bg-primary transition-all duration-500" />
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.15em]">{subtitle}</p>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-500">
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
        </Link>
    );
});

/* --- BACKGROUND ANIMATION COMPONENTS --- */

function StarBackground() {
    // Fix Hydration Mismatch: Only render stars on client
    const [stars, setStars] = useState<{ x: number; y: number; opacity: number; duration: number; delay: number }[]>([]);
    const [shootingStars, setShootingStars] = useState<{ yStart: number; yEnd: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        const starCount = 40;
        const newStars = Array.from({ length: starCount }).map(() => ({
            x: Math.random() * 2000,
            y: Math.random() * 1000,
            opacity: Math.random() * 0.5 + 0.2,
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 5
        }));
        setStars(newStars);

        const newShootingStars = Array.from({ length: 3 }).map(() => ({
            yStart: Math.random() * 600,
            yEnd: (Math.random() * 600) + 300,
            duration: 1.2 + Math.random() * 0.8,
            delay: Math.random() * 10
        }));
        setShootingStars(newShootingStars);
    }, []);

    if (stars.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Twinkling Stars */}
            {stars.map((star, i) => (
                <motion.div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_2px_rgba(255,255,255,0.8)]"
                    initial={{
                        opacity: star.opacity,
                        x: star.x,
                        y: star.y
                    }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.4, 1]
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: star.delay
                    }}
                />
            ))}

            {/* Shooting Star Wipes */}
            {shootingStars.map((shooting, i) => (
                <motion.div
                    key={`shooting-${i}`}
                    className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                    style={{ width: '180px', rotate: '-35deg' }}
                    initial={{ x: -300, y: shooting.yStart, opacity: 0 }}
                    animate={{
                        x: 2200,
                        y: shooting.yEnd,
                        opacity: [0, 1, 0.8, 0]
                    }}
                    transition={{
                        duration: shooting.duration,
                        repeat: Infinity,
                        repeatDelay: 2 + Math.random() * 10,
                        delay: i * 4 + shooting.delay,
                        ease: [0.43, 0.13, 0.23, 0.96]
                    }}
                />
            ))}
        </div>
    );
}
