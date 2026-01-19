"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { generateTripPlanAction, type TripPlanResponse, type TripActivity } from "@/app/actions/ai-planner";

export function AIPlannerSection() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<TripPlanResponse | null>(null);

    const handlePlan = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setPlan(null);
        try {
            const result = await generateTripPlanAction(query);
            setPlan(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative rounded-3xl overflow-hidden bg-card-dark border border-white/5 py-12 px-6 md:px-12 mb-24">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-4xl mx-auto text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold mb-4 border border-primary/20">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    AI Powered
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Plan your perfect trip in seconds
                </h2>
                <p className="text-gray-400 text-lg">
                    Tell us where, when, and who with. Our AI will build a custom itinerary with real bookable experiences.
                </p>
            </div>

            {/* Input Area */}
            <div className="max-w-2xl mx-auto relative mb-12">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-black rounded-2xl p-2 flex flex-col md:flex-row gap-2 border border-white/10">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Paris for a couple for 3 days..."
                            className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder-gray-500"
                            onKeyDown={(e) => e.key === "Enter" && handlePlan()}
                        />
                        <Button
                            onClick={handlePlan}
                            disabled={loading || !query}
                            className={`min-w-[140px] h-12 text-base ${loading ? 'opacity-80' : ''}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                    Planning...
                                </span>
                            ) : (
                                "Generate Plan"
                            )}
                        </Button>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs text-gray-400">
                    <span>Try:</span>
                    <button onClick={() => setQuery("Romantic weekend in Rome")} className="hover:text-primary transition-colors cursor-pointer border-b border-transparent hover:border-primary">
                        "Romantic weekend in Rome"
                    </button>
                    <span>•</span>
                    <button onClick={() => setQuery("Family trip to London 4 days")} className="hover:text-primary transition-colors cursor-pointer border-b border-transparent hover:border-primary">
                        "Family trip to London 4 days"
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {plan && (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Your trip to <span className="text-primary">{plan.destination}</span>
                        </h3>
                        <p className="text-gray-400 max-w-2xl mx-auto italic">
                            "{plan.summary}"
                        </p>
                    </div>

                    <div className="space-y-8 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-transparent opacity-30 md:-translate-x-1/2"></div>

                        {/* Group items by Day */}
                        {Array.from(new Set(plan.itinerary.map(i => i.day))).sort().map((day) => {
                            const dayActivities = plan.itinerary.filter(i => i.day === day);
                            return (
                                <div key={day} className="relative z-10">
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-primary/20">
                                            Day {day}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {dayActivities.map((activity, idx) => (
                                            <TripActivityCard key={activity.activityId} activity={activity} index={idx} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}

function TripActivityCard({ activity, index }: { activity: TripActivity, index: number }) {
    const isLeft = index % 2 === 0;

    return (
        <div className={`flex flex-col md:flex-row items-center gap-6 md:gap-0 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
            {/* Content Side */}
            <div className={`w-full md:w-1/2 px-4 md:px-12 ${isLeft ? 'md:text-left' : 'md:text-right'}`}>
                <div className={`inline-flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${activity.timeOfDay === 'morning' ? 'text-yellow-400' :
                        activity.timeOfDay === 'afternoon' ? 'text-orange-400' : 'text-indigo-400'
                    }`}>
                    <span className="material-symbols-outlined text-base">
                        {activity.timeOfDay === 'morning' ? 'wb_sunny' :
                            activity.timeOfDay === 'afternoon' ? 'light_mode' : 'dark_mode'}
                    </span>
                    {activity.timeOfDay}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{activity.title}</h4>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {activity.description}
                </p>
                <div className={`flex items-center gap-4 ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
                    <span className="text-white font-bold">{activity.currency}{activity.price}</span>
                    <Link href={activity.productUrl} className="text-primary hover:text-white text-sm font-bold flex items-center gap-1 group">
                        View Details
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>
            </div>

            {/* Timeline Dot */}
            <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background-dark shadow-[0_0_10px_rgba(43,140,238,0.5)] md:-translate-x-1/2"></div>

            {/* Image Side */}
            <div className="w-full md:w-1/2 px-4 md:px-12 pl-12 md:pl-12">
                <Link href={activity.productUrl} className="block relative aspect-[16/9] rounded-2xl overflow-hidden group border border-white/10">
                    <Image
                        src={activity.image}
                        alt={activity.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </Link>
            </div>
        </div>
    );
}
