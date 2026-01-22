import React from "react";
import { createClient } from "@/lib/supabase/server";
import FavoriteCard from "@/components/dashboard/FavoriteCard";
import log from "@/lib/logging";

export default async function FavoritesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch favorites with product details
    const { data: favorites, error } = await supabase
        .from("favorites")
        .select(`
            activity_id,
            products (
                product_code,
                title,
                primary_image,
                price_from,
                currency,
                rating,
                review_count
            )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

    if (error) {
        log.error("Error fetching favorites", error);
    }

    const transformedFavorites = favorites?.map((fav: any) => ({
        id: fav.activity_id, // favorites table has composite key or id, assuming usage
        product: {
            productCode: fav.products?.product_code,
            title: fav.products?.title || "Unknown",
            primaryImage: fav.products?.primary_image,
            priceFrom: fav.products?.price_from,
            currency: fav.products?.currency,
            rating: fav.products?.rating,
            reviewCount: fav.products?.review_count || 0
        }
    })) || [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Favorites</h1>
                <p className="text-muted-foreground">
                    Activities you have saved for later.
                </p>
            </div>

            {transformedFavorites.length === 0 ? (
                <div className="text-center py-20 bg-surface border border-white/10 rounded-3xl">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-muted-foreground">
                            favorite_border
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                        No favorites yet
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Browse activities and click the heart icon to save them here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {transformedFavorites.map((fav, index) => (
                        <FavoriteCard key={`${fav.id}-${index}`} favorite={fav} />
                    ))}
                </div>
            )}
        </div>
    );
}
