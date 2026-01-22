"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, MapPin, Clock, Utensils, Car, Train, Footprints, Navigation } from "lucide-react";

export type TransportMode = "walking" | "public" | "taxi" | "car";
export type PauseDuration = 0 | 15 | 30 | 60 | 120;

export interface FoodOption {
    id: string;
    title: string;
    image: string;
    price: number;
    currency: string;
    productUrl: string;
    rating?: number;
}

export interface SegmentData {
    fromActivityId: string;
    toActivityId: string;
    transport: TransportMode;
    pauseMinutes: PauseDuration;
    includeFood: boolean;
    selectedRestaurant?: FoodOption;
    mapRoute?: string; // URL to map route image or embed
}

interface SegmentCardProps {
    fromActivity: string;
    toActivity: string;
    segment: SegmentData;
    onSegmentChange: (segment: SegmentData) => void;
    onSearchRestaurants: () => Promise<FoodOption[]>;
    isLoading?: boolean;
}

const transportOptions: { id: TransportMode; icon: typeof Footprints; labelKey: string }[] = [
    { id: "walking", icon: Footprints, labelKey: "transportWalking" },
    { id: "public", icon: Train, labelKey: "transportPublic" },
    { id: "taxi", icon: Car, labelKey: "transportTaxi" },
    { id: "car", icon: Navigation, labelKey: "transportCar" },
];

const pauseOptions: { minutes: PauseDuration; labelKey: string }[] = [
    { minutes: 0, labelKey: "pauseNone" },
    { minutes: 15, labelKey: "pause15" },
    { minutes: 30, labelKey: "pause30" },
    { minutes: 60, labelKey: "pause60" },
    { minutes: 120, labelKey: "pause120" },
];

export function SegmentCard({
    fromActivity,
    toActivity,
    segment,
    onSegmentChange,
    onSearchRestaurants,
    isLoading = false,
}: SegmentCardProps) {
    const t = useTranslations("aiPlan");
    const [isExpanded, setIsExpanded] = useState(false);
    const [restaurants, setRestaurants] = useState<FoodOption[]>([]);
    const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const handleTransportChange = (transport: TransportMode) => {
        // Suggest a pause based on transport mode
        const recommendedPause: Record<TransportMode, PauseDuration> = {
            walking: 30, // Walking take longer, need more rest
            public: 30,  // Waiting for bus/train
            taxi: 15,    // Fast
            car: 15      // Fast
        };

        onSegmentChange({
            ...segment,
            transport,
            pauseMinutes: recommendedPause[transport]
        });
    };

    const handlePauseChange = (pauseMinutes: PauseDuration) => {
        onSegmentChange({ ...segment, pauseMinutes });
    };

    const handleFoodToggle = async (includeFood: boolean) => {
        onSegmentChange({ ...segment, includeFood, selectedRestaurant: undefined });

        if (includeFood && restaurants.length === 0) {
            setIsLoadingRestaurants(true);
            try {
                const results = await onSearchRestaurants();
                setRestaurants(results);
            } catch (error) {
                console.error("Failed to load restaurants:", error);
            } finally {
                setIsLoadingRestaurants(false);
            }
        }
    };

    const handleSelectRestaurant = (restaurant: FoodOption) => {
        onSegmentChange({ ...segment, selectedRestaurant: restaurant });
    };

    const toggleMap = () => {
        setShowMap(!showMap);
    };

    // Generate Google Maps directions URL
    const getMapUrl = () => {
        // origin and destination are now locations if available, titles otherwise
        const origin = encodeURIComponent(fromActivity);
        const destination = encodeURIComponent(toActivity);

        const mode = segment.transport === "walking" ? "walking"
            : segment.transport === "public" ? "transit"
                : "driving";

        // Use a generic embed URL that works better for directions
        return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${origin}&destination=${destination}&mode=${mode}`;
    };

    return (
        <div className="relative my-4">
            {/* Connector Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-cyan-500/30 md:-translate-x-1/2 z-0" />

            {/* Segment Card */}
            <div className="relative z-10 mx-auto max-w-2xl">
                {/* Collapsed View */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-surface-elevated/80 backdrop-blur-md border border-theme rounded-2xl hover:border-primary/30 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        {/* Transport Icon */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {segment.transport === "walking" && <Footprints className="w-5 h-5 text-primary" />}
                            {segment.transport === "public" && <Train className="w-5 h-5 text-primary" />}
                            {segment.transport === "taxi" && <Car className="w-5 h-5 text-primary" />}
                            {segment.transport === "car" && <Navigation className="w-5 h-5 text-primary" />}
                        </div>

                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground">
                                {t(`transport${segment.transport.charAt(0).toUpperCase() + segment.transport.slice(1)}` as any)}
                                {segment.pauseMinutes > 0 && (
                                    <span className="text-muted-foreground ml-2">
                                        + {segment.pauseMinutes} min {t("pauseLabel")}
                                    </span>
                                )}
                            </p>
                            {segment.selectedRestaurant && (
                                <p className="text-xs text-primary flex items-center gap-1">
                                    <Utensils className="w-3 h-3" />
                                    {segment.selectedRestaurant.title}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                            {t("adjustOptions")}
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                    </div>
                </button>

                {/* Expanded View */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 p-6 bg-surface border border-theme rounded-2xl space-y-6">
                                {/* Transport Selection */}
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {t("transportTitle")}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {transportOptions.map((option) => {
                                            const Icon = option.icon;
                                            const isSelected = segment.transport === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleTransportChange(option.id)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isSelected
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                        : "bg-white/5 text-foreground hover:bg-white/10 border border-theme"
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {t(option.labelKey as any)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pause Duration */}
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {t("pauseTitle")}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {pauseOptions.map((option) => {
                                            const isSelected = segment.pauseMinutes === option.minutes;
                                            return (
                                                <button
                                                    key={option.minutes}
                                                    onClick={() => handlePauseChange(option.minutes)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isSelected
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                        : "bg-white/5 text-foreground hover:bg-white/10 border border-theme"
                                                        }`}
                                                >
                                                    {t(option.labelKey as any)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Food Option */}
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                                        <Utensils className="w-4 h-4 text-primary" />
                                        {t("foodTitle")}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground mb-3 opacity-70">
                                        {t("culinaryNote") || "Tischreservierungen sind über Viator nicht möglich. Wir schlagen dir passende kulinarische Erlebnisse vor."}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <button
                                            onClick={() => handleFoodToggle(true)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${segment.includeFood
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-white/5 text-foreground hover:bg-white/10 border border-theme"
                                                }`}
                                        >
                                            {t("foodYes")}
                                        </button>
                                        <button
                                            onClick={() => handleFoodToggle(false)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!segment.includeFood
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-white/5 text-foreground hover:bg-white/10 border border-theme"
                                                }`}
                                        >
                                            {t("foodNo")}
                                        </button>
                                    </div>

                                    {/* Restaurant List */}
                                    {segment.includeFood && (
                                        <div className="space-y-3">
                                            {isLoadingRestaurants ? (
                                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                    <span className="text-sm text-muted-foreground">{t("loadingRestaurants")}</span>
                                                </div>
                                            ) : restaurants.length > 0 ? (
                                                <div className="grid gap-3">
                                                    {restaurants.slice(0, 3).map((restaurant) => (
                                                        <button
                                                            key={restaurant.id}
                                                            onClick={() => handleSelectRestaurant(restaurant)}
                                                            className={`flex items-center gap-4 p-3 rounded-xl transition-all text-left ${segment.selectedRestaurant?.id === restaurant.id
                                                                ? "bg-primary/20 border-2 border-primary"
                                                                : "bg-white/5 border border-theme hover:border-primary/30"
                                                                }`}
                                                        >
                                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                                                <Image
                                                                    src={restaurant.image}
                                                                    alt={restaurant.title}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {restaurant.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {restaurant.currency}{restaurant.price}
                                                                    {restaurant.rating && (
                                                                        <span className="ml-2 text-yellow-400">★ {restaurant.rating}</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            {segment.selectedRestaurant?.id === restaurant.id && (
                                                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground p-4 bg-white/5 rounded-xl">
                                                    {t("noRestaurantsFound")}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Map View Button */}
                                <div>
                                    <button
                                        onClick={toggleMap}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-theme rounded-xl text-sm font-medium text-foreground transition-all"
                                    >
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {showMap ? t("hideMap") : t("showMap")}
                                    </button>

                                    {/* Map Embed */}
                                    <AnimatePresence>
                                        {showMap && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 300 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 rounded-xl overflow-hidden border border-theme"
                                            >
                                                <iframe
                                                    src={getMapUrl()}
                                                    width="100%"
                                                    height="300"
                                                    style={{ border: 0 }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
