import { NextRequest, NextResponse } from "next/server";
import { getViatorProductDetails } from "@/lib/api/viator-client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const productDetails = await getViatorProductDetails(id);

    if (productDetails.error) {
        return NextResponse.json(
            { error: productDetails.error },
            { status: 404 }
        );
    }

    // Transform Viator product to our format
    const activity = {
        id: productDetails.productCode,
        title: productDetails.title,
        location: productDetails.destinations?.[0]?.name || "",
        image: productDetails.images?.[0]?.variants?.find((v: any) => v.width >= 720)?.url
            || productDetails.images?.[0]?.variants?.[0]?.url || "",
        price: productDetails.pricing?.summary?.fromPrice || 0,
        currency: productDetails.pricing?.currency || "EUR",
        rating: productDetails.reviews?.combinedAverageRating || 0,
        reviewCount: productDetails.reviews?.totalReviews || 0,
        duration: formatDuration(productDetails.duration),
        productCode: productDetails.productCode,
        description: productDetails.description || "",
    };

    return NextResponse.json(activity);
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
