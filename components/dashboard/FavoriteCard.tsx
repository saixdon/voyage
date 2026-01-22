"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations, useFormatter } from "next-intl";

interface FavoriteCardProps {
    favorite: {
        id: string;
        product: {
            productCode: string;
            title: string;
            primaryImage: string | null;
            priceFrom: number | null | any;
            currency: string;
            rating: number | null | any;
            reviewCount: number;
        };
    };
}

export default function FavoriteCard({ favorite }: FavoriteCardProps) {
    const t = useTranslations("dashboard.favorites"); // Assuming we might add translations later
    const format = useFormatter();
    const { product } = favorite;

    return (
        <Link
            href={`/activity/${product.productCode}`}
            className="block group bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
        >
            <div className="aspect-[4/3] relative bg-white/5">
                {product.primaryImage ? (
                    <Image
                        src={product.primaryImage}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <span className="material-symbols-outlined text-4xl">image</span>
                    </div>
                )}

                {/* Rating Badge */}
                {product.rating && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-white">
                        <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                        <span>{Number(product.rating).toFixed(1)}</span>
                        <span className="text-white/60 font-normal">({product.reviewCount})</span>
                    </div>
                )}

                {/* Favorite Button (Visual only here, functionally on page or interactive) */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-lg filled">favorite</span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {product.title}
                </h3>

                <div className="flex items-end justify-between mt-auto">
                    <div className="text-sm text-muted-foreground">
                        From
                    </div>
                    <div className="text-lg font-bold text-primary">
                        {product.priceFrom
                            ? format.number(Number(product.priceFrom), {
                                style: "currency",
                                currency: product.currency || "EUR"
                            })
                            : "Free"}
                    </div>
                </div>
            </div>
        </Link>
    );
}
