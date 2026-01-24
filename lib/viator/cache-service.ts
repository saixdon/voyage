/**
 * Database-backed cache service for Viator data
 * 
 * This replaces the in-memory cache with persistent Supabase storage.
 * Data is written by the ingestion service and read by this cache.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use anon key for read-only access (respects RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface CachedDestination {
    destinationId: number;
    name: string;
    type: string;
    namesByLocale?: Record<string, string>;
}

export interface CachedTag {
    tagId: number;
    namesByLocale: Record<string, string>;
    parentTagIds?: number[];
}

/**
 * Get all destinations from database cache
 * Falls back to API if database is empty
 */
export async function getCachedDestinations(locale = "en"): Promise<CachedDestination[]> {
    const { data, error } = await supabase
        .from('viator_destinations')
        .select('destination_id, name, type, names_by_locale');

    if (error) {
        console.error('Failed to fetch cached destinations:', error);
        return [];
    }

    if (!data || data.length === 0) {
        console.warn('No destinations in cache - run ingestion first');
        return [];
    }

    return data.map(d => ({
        destinationId: d.destination_id,
        name: d.names_by_locale?.[locale] || d.name,
        type: d.type,
        namesByLocale: d.names_by_locale
    }));
}

/**
 * Get all tags from database cache
 */
export async function getCachedTags(locale = "en"): Promise<CachedTag[]> {
    const { data, error } = await supabase
        .from('viator_tags')
        .select('tag_id, names_by_locale, parent_tag_ids');

    if (error) {
        console.error('Failed to fetch cached tags:', error);
        return [];
    }

    if (!data || data.length === 0) {
        console.warn('No tags in cache - run ingestion first');
        return [];
    }

    return data.map(t => ({
        tagId: t.tag_id,
        namesByLocale: t.names_by_locale || {},
        parentTagIds: t.parent_tag_ids || []
    }));
}

/**
 * Find destination ID by name (from cache)
 */
export async function findDestinationId(query: string, locale = "en"): Promise<number | null> {
    const destinations = await getCachedDestinations(locale);
    const queryLower = query.toLowerCase().trim();

    // Exact match first
    let match = destinations.find(d => d.name.toLowerCase() === queryLower);

    // Starts with
    if (!match) {
        match = destinations.find(d => d.name.toLowerCase().startsWith(queryLower));
    }

    // Contains
    if (!match) {
        match = destinations.find(d => d.name.toLowerCase().includes(queryLower));
    }

    return match?.destinationId || null;
}

/**
 * Get tag name in a specific locale
 */
export async function getTagName(tagId: number, locale = "en"): Promise<string | null> {
    const { data, error } = await supabase
        .from('viator_tags')
        .select('names_by_locale')
        .eq('tag_id', tagId)
        .single();

    if (error || !data) {
        return null;
    }

    return data.names_by_locale?.[locale] || data.names_by_locale?.['en'] || null;
}

/**
 * Get availability schedule for a product from cache
 */
export async function getCachedAvailabilitySchedule(productCode: string): Promise<any | null> {
    const { data, error } = await supabase
        .from('viator_availability_schedules')
        .select('schedule_data, fetched_at')
        .eq('product_code', productCode)
        .single();

    if (error || !data) {
        return null;
    }

    // Check if data is stale (older than 2 hours)
    const fetchedAt = new Date(data.fetched_at);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    if (fetchedAt < twoHoursAgo) {
        console.warn(`Availability for ${productCode} is stale (${data.fetched_at})`);
        // Still return it, but caller should consider refreshing
    }

    return data.schedule_data;
}

/**
 * Search products in local database
 */
export async function searchProductsInDb(
    query: string,
    limit = 20,
    filters?: {
        destinationId?: number;
        tagIds?: number[];
        minPrice?: number;
        maxPrice?: number;
    }
): Promise<any[]> {
    let queryBuilder = supabase
        .from('products')
        .select('*')
        .eq('status', 'ACTIVE');

    // Text search on title
    if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    // Price filters
    if (filters?.minPrice !== undefined) {
        queryBuilder = queryBuilder.gte('pricing->summary->fromPrice', filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
        queryBuilder = queryBuilder.lte('pricing->summary->fromPrice', filters.maxPrice);
    }

    // Apply limit and order by rating
    queryBuilder = queryBuilder
        .order('reviews->combinedAverageRating', { ascending: false, nullsFirst: false })
        .limit(limit);

    const { data, error } = await queryBuilder;

    if (error) {
        console.error('Product search error:', error);
        return [];
    }

    return data || [];
}

/**
 * Get product count in database
 */
export async function getProductCount(): Promise<number> {
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

    if (error) {
        console.error('Failed to get product count:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Check if cache has been populated
 */
export async function isCachePopulated(): Promise<{
    products: number;
    destinations: number;
    tags: number;
}> {
    const [products, destinations, tags] = await Promise.all([
        getProductCount(),
        getCachedDestinations().then(d => d.length),
        getCachedTags().then(t => t.length)
    ]);

    return { products, destinations, tags };
}
