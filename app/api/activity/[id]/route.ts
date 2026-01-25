import { NextRequest, NextResponse } from "next/server";
import { getViatorProductDetails } from "@/lib/api/viator-client";
import { resolveDestinationNames } from "@/lib/api/destination-resolver";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const productDetails = await getViatorProductDetails(id);

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
            // Fallback to safe default
        }

        // Transform Viator product to our format with safe fallbacks
        const activity = {
            id: productDetails.productCode,
            title: productDetails.title || "Untitled Activity",
            location: locationName,
            image: primaryImage,
            images: allImages,
            price: productDetails.pricing?.summary?.fromPrice || 0,
            currency: productDetails.pricing?.currency || "EUR",
            rating: productDetails.reviews?.combinedAverageRating || 0,
            reviewCount: productDetails.reviews?.totalReviews || 0,
            duration: formatDuration(productDetails.duration),
            productCode: productDetails.productCode,
            productUrl: productDetails.productUrl || "",
            description: productDetails.description || "Description not available.",
            badge: productDetails.flags?.includes("BEST_SELLER") ? "Bestseller" : undefined,
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
