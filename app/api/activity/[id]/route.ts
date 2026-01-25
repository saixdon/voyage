import { NextRequest, NextResponse } from "next/server";
import { getViatorProductDetails, getViatorProductReviews } from "@/lib/api/viator-client";
import { resolveDestinationNames } from "@/lib/api/destination-resolver";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Try fetching from Supabase (Source of Truth)
        try {
            const supabase = await createClient();
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('product_code', id)
                .single();

            if (!error && product) {
                // Return DB data structure matching UI expectations
                // This ensures consistency with Search results

                // Extract best image
                let image = "";
                let images: string[] = [];
                if (product.images && Array.isArray(product.images)) {
                    // Main image
                    const firstImage = product.images[0];
                    if (firstImage?.variants && Array.isArray(firstImage.variants)) {
                        const hdVariant = firstImage.variants.find((v: any) => v.width >= 720);
                        image = hdVariant?.url || firstImage.variants[0]?.url || "";
                    }
                    // Gallery images
                    images = product.images.slice(0, 5).map((img: any) => {
                        const v = img.variants?.find((v: any) => v.width >= 1080) || img.variants?.[0];
                        return v?.url;
                    }).filter(Boolean);
                }

                // Extract duration
                let duration = "";
                if (product.duration?.fixedDurationInMinutes) {
                    const hours = Math.floor(product.duration.fixedDurationInMinutes / 60);
                    const mins = product.duration.fixedDurationInMinutes % 60;
                    duration = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'min' : ''}` : `${mins} min`;
                } else if (product.duration?.variableDurationFromMinutes) {
                    const fromH = Math.floor(product.duration.variableDurationFromMinutes / 60);
                    const toH = Math.floor((product.duration.variableDurationToMinutes || product.duration.variableDurationFromMinutes) / 60);
                    duration = `${fromH}-${toH} hours`;
                }

                const activity = {
                    id: product.product_code,
                    title: product.title,
                    location: product.destinations?.[0]?.name || "Location available at booking",
                    image,
                    images,
                    // HERE is the fix: DB has the correct "fromPrice"
                    price: product.pricing?.summary?.fromPrice || 0,
                    currency: product.pricing?.currency || "EUR",
                    rating: product.reviews?.combinedAverageRating || 0,
                    reviewCount: product.reviews?.totalReviews || 0,
                    duration,
                    productCode: product.product_code,
                    productUrl: product.productUrl || "",
                    description: product.description || "Description not available.",
                    badge: undefined, // Could map flags if stored
                    productOptions: product.productOptions || [],
                    inclusions: product.inclusions || [],
                    exclusions: product.exclusions || [],
                    userReviews: product.userReviews || [], // If we sync reviews
                    reviewsStats: product.reviewsStats || null,
                    lat: undefined,
                    lng: undefined
                };

                // If DB data seems complete, return it
                if (activity.price > 0 && activity.title) {
                    return NextResponse.json(activity);
                }
            }
        } catch (dbError) {
            console.error("DB Fetch Error (falling back to API):", dbError);
        }

        // 2. API Fallback (Existing Logic)
        // Fetch details and reviews in parallel
        const [productDetails, reviewsResult] = await Promise.all([
            getViatorProductDetails(id),
            getViatorProductReviews(id)
        ]);

        // Mock fallback if API returns error (e.g. 401/404 because of invalid keys)
        if (productDetails.error && (id.startsWith("mock-") || productDetails.error.includes("401") || productDetails.error.includes("403"))) {
            // ... (Keep existing mock logic if needed, but for brevity here I focus on main path)
            // Actually, let's keep the mock logic from original file to avoid regression
            return NextResponse.json({
                id: id,
                title: `Mock Activity Details for ${id}`,
                location: "Mock City, Country",
                image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
                price: 55.00,
                currency: "EUR",
                rating: 4.8,
                reviewCount: 320,
                duration: "3 hours",
                productCode: id,
                description: "This is a mock description.",
                badge: "Bestseller",
                lat: 48.8566,
                lng: 2.3522
            });
        }

        if (productDetails.error) {
            if (!id.startsWith("mock-")) {
                return NextResponse.json(
                    { error: productDetails.error },
                    { status: 404 }
                );
            }
            // Fallback for mock IDs
            return NextResponse.json({
                id: id,
                title: `Mock Activity Details for ${id}`,
                location: "Mock City, Country",
                image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
                images: [],
                price: 55.00,
                currency: "EUR",
                rating: 4.8,
                reviewCount: 320,
                duration: "3 hours",
                productCode: id,
                productUrl: "",
                description: "This is a mock description.",
                badge: "Bestseller",
                lat: 48.8566,
                lng: 2.3522
            });
        }

        // Extract best image
        const primaryImage = productDetails.images?.[0]?.variants?.find((v: any) => v.width >= 720)?.url
            || productDetails.images?.[0]?.variants?.[0]?.url
            || "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80";

        // Extract multiple images for gallery
        const allImages = productDetails.images?.slice(0, 5).map((img: any) => {
            const variant = img.variants?.find((v: any) => v.width >= 720) || img.variants?.[0];
            return variant?.url;
        }).filter(Boolean) || [];

        // Extract Location Name (Safely)
        let locationName = "Location available at booking";
        try {
            if (productDetails.destinations && productDetails.destinations.length > 0) {
                locationName = await resolveDestinationNames(productDetails.destinations) || locationName;
            }
        } catch (locError) {
            console.error("Location resolution failed in route handler:", locError);
        }

        // Extract duration from itinerary if not at root level
        const durationData = productDetails.duration || productDetails.itinerary?.duration;

        // Extract price - try pricing.summary first, then fallback to availability/schedules
        let price = productDetails.pricing?.summary?.fromPrice || 0;
        let currency = productDetails.pricing?.currency || "EUR";

        if (price === 0) {
            // Fallback: Fetch from availability/schedules (lightweight call)
            try {
                const scheduleRes = await fetch(
                    `${process.env.VIATOR_API_BASE_URL || "https://api.sandbox.viator.com/partner"}/availability/schedules/${productDetails.productCode}?currency=EUR`,
                    {
                        headers: {
                            "Accept": "application/json;version=2.0",
                            "Accept-Language": "en",
                            "exp-api-key": process.env.VIATOR_API_KEY!,
                        },
                        next: { revalidate: 3600 }
                    }
                );
                if (scheduleRes.ok) {
                    const scheduleData = await scheduleRes.json();
                    const firstPrice = scheduleData.bookableItems?.[0]?.seasons?.[0]?.pricingRecords?.[0]?.pricingDetails?.[0]?.price?.original?.recommendedRetailPrice;
                    if (firstPrice) {
                        price = firstPrice;
                    }
                }
            } catch (priceErr) {
                console.error("Price fallback failed:", priceErr);
            }
        }

        // Transform Viator product to our format with safe fallbacks
        const activity = {
            id: productDetails.productCode,
            title: productDetails.title || "Untitled Activity",
            location: locationName,
            image: primaryImage,
            images: allImages,
            price,
            currency,
            rating: productDetails.reviews?.combinedAverageRating || 0,
            reviewCount: productDetails.reviews?.totalReviews || 0,
            duration: formatDuration(durationData),
            productCode: productDetails.productCode,
            productUrl: productDetails.productUrl || "",
            description: productDetails.description || "Description not available.",
            badge: productDetails.flags?.includes("BEST_SELLER") ? "Bestseller" : undefined,
            // NEU: Produkt-Optionen für das Frontend
            productOptions: productDetails.productOptions || [],
            // NEU: Zusätzliche Info
            inclusions: productDetails.inclusions || [],
            exclusions: productDetails.exclusions || [],
            userReviews: reviewsResult?.reviews || [],
            reviewsStats: reviewsResult?.totalReviewsSummary || null,
            lat: undefined,
            lng: undefined
        };

        return NextResponse.json(activity);

    } catch (globalError) {
        console.error("Activity API Fatal Error:", globalError);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function formatDuration(duration?: {
    fixedDurationInMinutes?: number;
    variableDurationFromMinutes?: number;
    variableDurationToMinutes?: number;
}): string {
    if (!duration) return "";

    if (duration.fixedDurationInMinutes) {
        const hours = Math.floor(duration.fixedDurationInMinutes / 60);
        const mins = duration.fixedDurationInMinutes % 60;
        if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
        if (hours > 0) return `${hours} hours`;
        return `${mins} min`;
    }

    if (duration.variableDurationFromMinutes && duration.variableDurationToMinutes) {
        const fromHours = Math.floor(duration.variableDurationFromMinutes / 60);
        const toHours = Math.floor(duration.variableDurationToMinutes / 60);
        return `${fromHours}-${toHours} hours`;
    }

    return "";
}
