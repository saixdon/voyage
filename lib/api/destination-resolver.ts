/**
 * Helper to resolve destination IDs to names using the viator_destinations table
 */

import { createClient } from '@supabase/supabase-js';

// In-memory cache to avoid DB calls for every request
const destinationCache = new Map<number, string>();

// Create a singleton Supabase client for destination lookups (read-only)
const getSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase credentials not configured');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
};

export async function resolveDestinationName(destinationId: number | string): Promise<string> {
    const destId = typeof destinationId === 'string' ? parseInt(destinationId) : destinationId;

    // Check cache first
    if (destinationCache.has(destId)) {
        return destinationCache.get(destId)!;
    }

    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('viator_destinations')
            .select('name')
            .eq('destination_id', destId)
            .single();

        if (error || !data) {
            console.warn(`Could not resolve destination ID ${destId}`);
            return '';
        }

        // Cache the result
        destinationCache.set(destId, data.name);
        return data.name;
    } catch (error) {
        console.error(`Error resolving destination ${destId}:`, error);
        return '';
    }
}

/**
 * Resolve multiple destination refs to names
 */
export async function resolveDestinationNames(destinations: Array<{ ref: string, primary?: boolean }>): Promise<string> {
    if (!destinations || destinations.length === 0) {
        return '';
    }

    // Find primary destination or use first one
    const primary = destinations.find(d => d.primary) || destinations[0];
    return await resolveDestinationName(primary.ref);
}

/**
 * Batch resolve destinations for an array of products
 * Returns a Map<productCode, locationName>
 */
export async function batchResolveDestinations(
    products: Array<{ productCode: string; destinations?: Array<{ ref: string, primary?: boolean }> }>
): Promise<Map<string, string>> {
    const supabase = getSupabaseClient();
    const result = new Map<string, string>();

    // Collect unique destination IDs
    const destIds = new Set<number>();
    products.forEach(p => {
        if (p.destinations && p.destinations.length > 0) {
            const primary = p.destinations.find(d => d.primary) || p.destinations[0];
            destIds.add(parseInt(primary.ref));
        }
    });

    if (destIds.size === 0) return result;

    // Batch fetch from DB
    const { data, error } = await supabase
        .from('viator_destinations')
        .select('destination_id, name')
        .in('destination_id', Array.from(destIds));

    if (error || !data) {
        console.error('Batch destination resolve error:', error);
        return result;
    }

    // Create lookup map
    const destMap = new Map<number, string>();
    data.forEach((d: any) => {
        destMap.set(d.destination_id, d.name);
        destinationCache.set(d.destination_id, d.name); // Also update cache
    });

    // Map products to locations
    products.forEach(p => {
        if (p.destinations && p.destinations.length > 0) {
            const primary = p.destinations.find(d => d.primary) || p.destinations[0];
            const destId = parseInt(primary.ref);
            const name = destMap.get(destId) || '';
            result.set(p.productCode, name);
        }
    });

    return result;
}
