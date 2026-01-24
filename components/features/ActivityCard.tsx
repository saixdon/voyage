import React from "react";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites/favorites-context";

interface ActivityCardProps {
    id: string;
    title: string;
    location: string;
    image: string;
    price: number;
    currency?: string;
    rating: number;
    reviewCount: number;
    duration: string;
    badge?: "bestseller" | "likely-to-sell-out" | "top-pick";
    isSaved?: boolean;
    onSave?: () => void;
}

export function ActivityCard({
    id,
    title,
    location,
    image,
    price,
    currency = "€",
    rating,
    reviewCount,
    duration,
    badge,
    isSaved = false,
    onSave,
}: ActivityCardProps) {
    const badgeStyles = {
        bestseller: "bg-white/10 backdrop-blur-md",
        "likely-to-sell-out": "bg-primary/80 backdrop-blur-md",
        "top-pick": "bg-white/10 backdrop-blur-md",
    };

    const badgeLabels = {
        bestseller: "Bestseller",
        "likely-to-sell-out": "Likely to sell out",
        "top-pick": "Top Pick",
    };

    const renderStars = () => {
        const stars = [];
        // Round to nearest 0.5
        const roundedRating = Math.round(rating * 2) / 2;
        const fullStars = Math.floor(roundedRating);
        const hasHalfStar = roundedRating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <span key={`full-${i}`} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                </span>
            );
        }
        if (hasHalfStar) {
            stars.push(
                <span key="half" className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star_half
                </span>
            );
        }
        const emptyStars = 5 - Math.ceil(roundedRating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <span key={`empty-${i}`} className="material-symbols-outlined text-base">
                    star_border
                </span>
            );
        }
        return stars;
    };

    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const isActivitySaved = isFavorite(id);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isActivitySaved) {
            await removeFavorite(id);
        } else {
            await addFavorite({
                activity_id: id,
                activity_title: title,
                activity_image: image,
                activity_location: location,
                activity_price: price,
                activity_currency: currency,
                activity_rating: rating,
                activity_review_count: reviewCount,
                activity_duration: duration
            });
        }
        onSave?.();
    };

    return (
        <Link href={`/activities/${id}`} className="block h-full group">
            <div className="h-full bg-surface border border-theme rounded-2xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-[0_20px_40px_rgba(43,140,238,0.2)] hover:border-primary/50 hover:-translate-y-2">
                <div className="relative aspect-[4/3] overflow-hidden">
                    {badge && (
                        <div
                            className={`absolute top-4 left-4 ${badgeStyles[badge]} px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/10 z-20`}
                        >
                            {badgeLabels[badge]}
                        </div>
                    )}
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-black w-9 h-9 flex items-center justify-center rounded-full z-20 opacity-100 transition-all duration-300 hover:scale-110 shadow-md"
                    >
                        <span className={`material-symbols-outlined text-[20px] leading-none ${isActivitySaved ? "text-red-500" : "text-slate-600"}`} style={isActivitySaved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {isActivitySaved ? "favorite" : "favorite_border"}
                        </span>
                    </button>
                    <img
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={image}
                    />
                </div>
                <div className="p-4 space-y-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex text-yellow-500">
                            {renderStars()}
                        </div>
                        <span className="text-foreground font-bold text-xs ml-0.5">
                            {rating > 0 ? rating.toFixed(1) : "N/A"}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                            ({reviewCount.toLocaleString()})
                        </span>
                    </div>
                    <h3 className="text-foreground text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                        {title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span className="truncate">{location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        <span>{duration}</span>
                    </div>
                    <div className="pt-3 flex items-center justify-between border-t border-theme-light">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Ab</span>
                            <span className="text-foreground text-lg font-black">
                                {currency}{price}
                            </span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
