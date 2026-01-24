/**
 * Viator Data Ingestion Service
 * 
 * This service syncs data from Viator API to our Supabase database.
 * It implements the "Ingestion Model" as described in the Viator questionnaire.
 * 
 * Endpoints used:
 * - /products/modified-since (hourly) - Full product catalog
 * - /availability/schedules/modified-since (hourly) - Availability data
 * - /destinations (weekly) - Destination list
 * - /products/tags (weekly) - Tag/category list
 */

import { createClient } from '@supabase/supabase-js';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for write access (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface IngestionResult {
    success: boolean;
    itemsProcessed: number;
    itemsCreated: number;
    itemsUpdated: number;
    error?: string;
    nextCursor?: string;
}

/**
 * Log the start of an ingestion job
 */
async function startIngestionLog(entityType: string): Promise<string> {
    const { data, error } = await supabase
        .from('viator_ingestion_log')
        .insert({
            entity_type: entityType,
            status: 'running',
            started_at: new Date().toISOString()
        })
        .select('id')
        .single();

    if (error) {
        console.error('Failed to start ingestion log:', error);
        throw error;
    }

    return data.id;
}

/**
 * Complete an ingestion log entry
 */
async function completeIngestionLog(
    logId: string,
    result: IngestionResult,
    lastCursor?: string
): Promise<void> {
    await supabase
        .from('viator_ingestion_log')
        .update({
            status: result.success ? 'completed' : 'failed',
            completed_at: new Date().toISOString(),
            items_processed: result.itemsProcessed,
            items_created: result.itemsCreated,
            items_updated: result.itemsUpdated,
            error_message: result.error,
            last_cursor: lastCursor
        })
        .eq('id', logId);
}

/**
 * Get the last successful cursor for an entity type
 */
async function getLastCursor(entityType: string): Promise<string | null> {
    const { data } = await supabase
        .from('viator_ingestion_log')
        .select('last_cursor')
        .eq('entity_type', entityType)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    return data?.last_cursor || null;
}

/**
 * Ingest destinations from Viator API
 */
export async function ingestDestinations(): Promise<IngestionResult> {
    const logId = await startIngestionLog('destinations');
    let result: IngestionResult = {
        success: false,
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0
    };

    try {
        if (!VIATOR_API_KEY) {
            throw new Error('VIATOR_API_KEY not configured');
        }

        const response = await fetch(`${VIATOR_API_BASE}/destinations`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'exp-api-key': VIATOR_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const destinations = data.destinations || [];

        for (const dest of destinations) {
            result.itemsProcessed++;

            const { error } = await supabase
                .from('viator_destinations')
                .upsert({
                    destination_id: dest.destinationId,
                    name: dest.name,
                    type: dest.type,
                    parent_id: dest.parentId,
                    names_by_locale: { en: dest.name },
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'destination_id'
                });

            if (error) {
                console.error('Failed to upsert destination:', error);
            } else {
                result.itemsUpdated++;
            }
        }

        result.success = true;
        console.log(`Ingested ${result.itemsProcessed} destinations`);

    } catch (error: any) {
        result.error = error.message;
        console.error('Destination ingestion failed:', error);
    }

    await completeIngestionLog(logId, result);
    return result;
}

/**
 * Ingest tags from Viator API
 */
export async function ingestTags(): Promise<IngestionResult> {
    const logId = await startIngestionLog('tags');
    let result: IngestionResult = {
        success: false,
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0
    };

    try {
        if (!VIATOR_API_KEY) {
            throw new Error('VIATOR_API_KEY not configured');
        }

        const response = await fetch(`${VIATOR_API_BASE}/products/tags`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'exp-api-key': VIATOR_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const tags = data.tags || [];

        for (const tag of tags) {
            result.itemsProcessed++;

            const { error } = await supabase
                .from('viator_tags')
                .upsert({
                    tag_id: tag.tagId,
                    names_by_locale: tag.allNamesByLocale || {},
                    parent_tag_ids: tag.parentTagIds || [],
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'tag_id'
                });

            if (error) {
                console.error('Failed to upsert tag:', error);
            } else {
                result.itemsUpdated++;
            }
        }

        result.success = true;
        console.log(`Ingested ${result.itemsProcessed} tags`);

    } catch (error: any) {
        result.error = error.message;
        console.error('Tag ingestion failed:', error);
    }

    await completeIngestionLog(logId, result);
    return result;
}

/**
 * Ingest products using /products/modified-since endpoint
 * This is the main ingestion endpoint for the Ingestion Model
 */
export async function ingestProducts(fullSync = false): Promise<IngestionResult> {
    const logId = await startIngestionLog('products');
    let result: IngestionResult = {
        success: false,
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0
    };

    try {
        if (!VIATOR_API_KEY) {
            throw new Error('VIATOR_API_KEY not configured');
        }

        // Get the last cursor for delta sync
        let cursor = fullSync ? null : await getLastCursor('products');

        // If no cursor, use a date from 30 days ago for initial sync
        const modifiedSince = cursor ? undefined : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        let hasMore = true;
        let requestCount = 0;
        const MAX_REQUESTS = 100; // Safety limit

        while (hasMore && requestCount < MAX_REQUESTS) {
            requestCount++;

            const body: any = {
                count: 100, // Max per request
                currency: 'EUR'
            };

            if (cursor) {
                body.cursor = cursor;
            } else if (modifiedSince) {
                body.modifiedSince = modifiedSince;
            }

            const response = await fetch(`${VIATOR_API_BASE}/products/modified-since`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json;version=2.0',
                    'Accept-Language': 'en',
                    'exp-api-key': VIATOR_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const products = data.products || [];

            for (const product of products) {
                result.itemsProcessed++;

                const { error } = await supabase
                    .from('products')
                    .upsert({
                        product_code: product.productCode,
                        title: product.title,
                        description: product.description,
                        pricing: product.pricing,
                        images: product.images,
                        reviews: product.reviews,
                        duration: product.duration,
                        destinations: product.destinations,
                        tags: product.tags,
                        product_url: product.productUrl,
                        status: product.status || 'ACTIVE',
                        viator_modified_at: product.lastUpdatedAt,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'product_code'
                    });

                if (error) {
                    console.error('Failed to upsert product:', error);
                } else {
                    result.itemsUpdated++;
                }
            }

            // Update cursor for next page
            cursor = data.nextCursor;
            hasMore = !!cursor && products.length > 0;

            console.log(`Processed ${result.itemsProcessed} products (request ${requestCount})`);

            // Save cursor periodically
            if (cursor) {
                result.nextCursor = cursor;
            }

            // Rate limiting: wait 100ms between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        result.success = true;
        console.log(`Completed product ingestion: ${result.itemsProcessed} products`);

    } catch (error: any) {
        result.error = error.message;
        console.error('Product ingestion failed:', error);
    }

    await completeIngestionLog(logId, result, result.nextCursor);
    return result;
}

/**
 * Ingest availability schedules using /availability/schedules/modified-since
 */
export async function ingestAvailabilitySchedules(fullSync = false): Promise<IngestionResult> {
    const logId = await startIngestionLog('availability');
    let result: IngestionResult = {
        success: false,
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0
    };

    try {
        if (!VIATOR_API_KEY) {
            throw new Error('VIATOR_API_KEY not configured');
        }

        let cursor = fullSync ? null : await getLastCursor('availability');
        const modifiedSince = cursor ? undefined : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        let hasMore = true;
        let requestCount = 0;
        const MAX_REQUESTS = 100;

        while (hasMore && requestCount < MAX_REQUESTS) {
            requestCount++;

            const body: any = {
                count: 100,
                currency: 'EUR'
            };

            if (cursor) {
                body.cursor = cursor;
            } else if (modifiedSince) {
                body.modifiedSince = modifiedSince;
            }

            const response = await fetch(`${VIATOR_API_BASE}/availability/schedules/modified-since`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json;version=2.0',
                    'exp-api-key': VIATOR_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const schedules = data.availabilitySchedules || [];

            for (const schedule of schedules) {
                result.itemsProcessed++;

                // First check if product exists
                const { data: existingProduct } = await supabase
                    .from('products')
                    .select('product_code')
                    .eq('product_code', schedule.productCode)
                    .single();

                if (!existingProduct) {
                    // Skip if product doesn't exist in our DB yet
                    continue;
                }

                const { error } = await supabase
                    .from('viator_availability_schedules')
                    .upsert({
                        product_code: schedule.productCode,
                        schedule_data: schedule,
                        fetched_at: new Date().toISOString(),
                        viator_modified_at: schedule.lastUpdatedAt
                    }, {
                        onConflict: 'product_code'
                    });

                if (error) {
                    console.error('Failed to upsert availability:', error);
                } else {
                    result.itemsUpdated++;
                }
            }

            cursor = data.nextCursor;
            hasMore = !!cursor && schedules.length > 0;

            console.log(`Processed ${result.itemsProcessed} availability schedules (request ${requestCount})`);

            if (cursor) {
                result.nextCursor = cursor;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        result.success = true;
        console.log(`Completed availability ingestion: ${result.itemsProcessed} schedules`);

    } catch (error: any) {
        result.error = error.message;
        console.error('Availability ingestion failed:', error);
    }

    await completeIngestionLog(logId, result, result.nextCursor);
    return result;
}

/**
 * Run all ingestion jobs
 * Call this from a cron job or API route
 */
export async function runFullIngestion(options?: {
    products?: boolean;
    availability?: boolean;
    destinations?: boolean;
    tags?: boolean;
    fullSync?: boolean;
}): Promise<Record<string, IngestionResult>> {
    const results: Record<string, IngestionResult> = {};

    const opts = {
        products: true,
        availability: true,
        destinations: true,
        tags: true,
        fullSync: false,
        ...options
    };

    if (opts.destinations) {
        console.log('Starting destinations ingestion...');
        results.destinations = await ingestDestinations();
    }

    if (opts.tags) {
        console.log('Starting tags ingestion...');
        results.tags = await ingestTags();
    }

    if (opts.products) {
        console.log('Starting products ingestion...');
        results.products = await ingestProducts(opts.fullSync);
    }

    if (opts.availability) {
        console.log('Starting availability ingestion...');
        results.availability = await ingestAvailabilitySchedules(opts.fullSync);
    }

    return results;
}
