import React from "react";
import Link from "next/link";

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
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <span key={i} className="material-symbols-outlined text-base">
                    star
                </span>
            );
        }
        if (hasHalfStar) {
            stars.push(
                <span key="half" className="material-symbols-outlined text-base">
                    star_half
                </span>
            );
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <span key={`empty-${i}`} className="material-symbols-outlined text-base">
                    star_border
                </span>
            );
        }
        return stars;
    };

    return (
        <Link href={`/activities/${id}`} className="block min-w-[300px] md:min-w-[340px] snap-center group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-4">
                {badge && (
                    <div
                        className={`absolute top-3 left-3 ${badgeStyles[badge]} px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 z-20`}
                    >
                        {badgeLabels[badge]}
                    </div>
                )}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSave?.();
                    }}
                    className={`absolute top-3 right-3 bg-white text-black p-1.5 rounded-full z-20 ${isSaved ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                >
                    <span className="material-symbols-outlined text-sm block">
                        {isSaved ? "favorite" : "favorite_border"}
                    </span>
                </button>
                <img
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={image}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    {renderStars()}
                    <span className="text-gray-400 ml-1 text-xs">
                        ({reviewCount.toLocaleString()})
                    </span>
                </div>
                <h3 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-gray-400 text-sm">
                    {location} • {duration}
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-white font-bold">
                        From {currency}
                        {price}
                    </span>
                </div>
            </div>
        </Link>
    );
}
