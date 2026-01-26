import { NextRequest, NextResponse } from "next/server";
// import { searchActivities as searchGygActivities } from "@/lib/api/gyg-client";
import { searchViatorProducts } from "@/lib/api/viator-client";
import { createClient } from "@/lib/supabase/server"; // Use server client
import { Activity } from "@/types";
import { CATEGORY_MAPPING } from "@/lib/utils/categories";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const dateFrom = searchParams.get("from"); // YYYY-MM-DD
    const dateTo = searchParams.get("to");     // YYYY-MM-DD
    const limit = parseInt(searchParams.get("limit") || "20");
    const start = parseInt(searchParams.get("start") || "1"); // 1-indexed
    const locale = searchParams.get("locale") || "en";

    // New: Price filters from AI Query Parser
    const priceMin = searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : undefined;
    const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : undefined;

    // Resolve category/tag IDs
    const categoryInputs = searchParams.get("categories")?.split(",") || [];
    const categoryIds: number[] = [];

    categoryInputs.forEach(input => {
        // 1. Check if it's a known slug
        const mapping = CATEGORY_MAPPING.find(m => m.id === input);
        if (mapping) {
            categoryIds.push(mapping.viatorTagId);
        } else {
            // 2. Check if it's already a numeric tag ID
            const numericId = parseInt(input);
            if (!isNaN(numericId)) {
                categoryIds.push(numericId);
            }
        }
    });

    // Semantic filters
    const semanticTags = searchParams.get("tags")?.split(",") || [];
    const vibes = searchParams.get("vibes")?.split(",") || [];
    const persona = searchParams.get("persona");

    // Combine all semantic hints for DB filtering
    const dbTagFilters = [...semanticTags, ...vibes];
    if (persona) dbTagFilters.push(persona);

    let activities: Activity[] = [];
    let source = "none";
    let total = 0;

    // 0. Try Local Database First (Ingestion Model)
    try {
        const supabase = await createClient();

        // Count total matching rows first to know if we should rely on DB
        let countBuilder = supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'ACTIVE');

        if (query) {
            countBuilder = countBuilder.or(`title.ilike.%${query}%, description.ilike.%${query}%`);
        }

        // Logical filtering: Add semantic tags if present
        if (dbTagFilters.length > 0) {
            countBuilder = countBuilder.overlaps('tags', dbTagFilters);
        }

        const { count: dbTotal, error: countError } = await countBuilder;

        if (!countError && dbTotal !== null) {
            total = dbTotal;
        }

        // Fetch data with pagination
        let queryBuilder = supabase
            .from('products')
            .select('*')
            .eq('status', 'ACTIVE');

        if (query) {
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%, description.ilike.%${query}%`);
        }

        if (dbTagFilters.length > 0) {
            queryBuilder = queryBuilder.overlaps('tags', dbTagFilters);
        }

        // Calculate range (0-indexed for Supabase)
        const from = start - 1;
        const to = from + limit - 1;

        // Fetch more products if we have price filters (we'll filter in-memory and may need extras)
        const fetchLimit = (priceMin !== undefined || priceMax !== undefined) ? limit * 5 : limit;
        const fetchTo = from + fetchLimit - 1;

        const { data: dbProducts, error } = await queryBuilder.range(from, fetchTo);

        if (!error && dbProducts && dbProducts.length > 0) {
            activities = dbProducts.map((p: any) => {
                // Extract best image from JSONB array
                let image = "";
                if (p.images && Array.isArray(p.images)) {
                    const firstImage = p.images[0];
                    if (firstImage?.variants && Array.isArray(firstImage.variants)) {
                        // Prefer HD image >= 720px
                        const hdVariant = firstImage.variants.find((v: any) => v.width >= 720);
                        image = hdVariant?.url || firstImage.variants[0]?.url || "";
                    }
                }

                // Extract destination name
                let location = "";
                if (p.destinations && Array.isArray(p.destinations)) {
                    location = p.destinations[0]?.name || "";
                }

                // Format duration
                let duration = "";
                if (p.duration?.fixedDurationInMinutes) {
                    const hours = Math.floor(p.duration.fixedDurationInMinutes / 60);
                    const mins = p.duration.fixedDurationInMinutes % 60;
                    if (hours > 0 && mins > 0) duration = `${hours}h ${mins}min`;
                    else if (hours > 0) duration = `${hours} hours`;
                    else duration = `${mins} min`;
                } else if (p.duration?.variableDurationFromMinutes) {
                    const fromH = Math.floor(p.duration.variableDurationFromMinutes / 60);
                    const toH = Math.floor((p.duration.variableDurationToMinutes || p.duration.variableDurationFromMinutes) / 60);
                    duration = `${fromH}-${toH} hours`;
                }

                // Get localized title with fallback: locale -> en -> title
                const localizedTitle = p.titles_by_locale?.[locale]
                    || p.titles_by_locale?.['en']
                    || p.title;

                return {
                    id: p.product_code,
                    title: localizedTitle,
                    location,
                    image,
                    price: p.pricing?.summary?.fromPrice || 0,
                    currency: p.pricing?.currency || "EUR",
                    rating: p.reviews?.combinedAverageRating || 0,
                    reviewCount: p.reviews?.totalReviews || 0,
                    duration,
                    productCode: p.product_code,
                    source: 'viator-db'
                };
            });

            // Apply price filters if provided
            if (priceMin !== undefined) {
                activities = activities.filter(a => a.price >= priceMin);
            }
            if (priceMax !== undefined) {
                activities = activities.filter(a => a.price <= priceMax);
            }

            // Update total to reflect filtered count (approximate)
            if (priceMin !== undefined || priceMax !== undefined) {
                total = activities.length; // This is approximate for the filtered set
            }

            // Limit to requested page size
            activities = activities.slice(0, limit);

            source = "database";
            console.log(`Found ${activities.length} activities in local DB for "${query}" (priceMax: ${priceMax || 'none'})`);
        }
    } catch (dbError) {
        console.error("Database Search Error:", dbError);
    }


    // 1. GetYourGuide fallback removed due to API access issues (HTML 404s).
    // Proceeding directly to Viator API.

    // 2. Try Viator Live API if DB returned nothing OR if we have mixed results/no DB results
    // Only query API if DB result count is zero (simplification to avoid complex merging of paginated mixed sources)
    // OR if we are using search-api-first strategy for keywords. 
    // Current strategy: If DB gave results, stick with DB. If DB gave 0, try API.
    if (activities.length === 0) {
        try {
            console.log(`DB returned 0 results. Fetching from Viator API...`);
            const viatorResult = await searchViatorProducts(
                query,
                limit,
                dateFrom || undefined,
                dateTo || undefined,
                locale,
                {
                    priceMin: priceMin,
                    priceMax: priceMax,
                    tags: categoryIds.length > 0 ? categoryIds : undefined
                },
                start // PASS START PARAM
            );

            if (viatorResult.activities && viatorResult.activities.length > 0) {
                activities = viatorResult.activities as unknown as Activity[];
                source = "viator-api";
                total = viatorResult.totalCount || 0;
            }
        } catch (e) {
            console.error("Viator Search Error:", e);
        }
    }

    // Final filter and limit to ensure UI consistency
    if (priceMin !== undefined) {
        activities = activities.filter(a => a.price >= priceMin);
    }
    if (priceMax !== undefined) {
        activities = activities.filter(a => a.price <= priceMax);
    }

    // Update total if we filtered
    if (priceMin !== undefined || priceMax !== undefined) {
        total = activities.length;
    }

    // Ensure we respect the limit
    activities = activities.slice(0, limit);

    console.log(`returning ${activities.length} activities for query "${query}" (Source: ${source})`);

    return NextResponse.json({
        source,
        activities,
        total,
    });
}

