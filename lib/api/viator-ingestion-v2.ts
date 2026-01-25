/**
 * Viator Product Ingestion (Corrected Two-Step Process)
 * 
 * Step 1: /products/modified-since → Get list of changed product codes
 * Step 2: /products/bulk → Get full product details
 */

import { createClient } from '@/lib/supabase/server';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

interface IngestionResult {
    success: boolean;
    processed: number;
    error?: string;
    nextCursor?: string;
}

export async function ingestProducts(): Promise<IngestionResult> {
    const supabase = await createClient();

    // 1. Get last cursor
    const { data: logEntry } = await supabase
        .from('viator_ingestion_log')
        .select('last_cursor')
        .eq('entity_type', 'products')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    const cursor = logEntry?.last_cursor;

    try {
        // STEP 1: Get modified product codes
        const params = new URLSearchParams({ count: '100' });
        if (cursor) params.append('cursor', cursor);

        const modifiedResp = await fetch(
            `${VIATOR_API_BASE}/products/modified-since?${params}`,
            {
                headers: {
                    'Accept': 'application/json;version=2.0',
                    'exp-api-key': VIATOR_API_KEY!,
                    'Accept-Language': 'en'
                }
            }
        );

        if (!modifiedResp.ok) throw new Error(`API error: ${modifiedResp.status}`);

        const modData = await modifiedResp.json();
        const modProducts = modData.products || [];
        const nextCursor = modData.nextCursor;

        const activeCodes = modProducts
            .filter((p: any) => p.status === 'ACTIVE')
            .map((p: any) => p.productCode);

        if (activeCodes.length === 0) {
            await supabase.from('viator_ingestion_log').insert({
                entity_type: 'products',
                last_cursor: nextCursor,
                status: 'completed',
                items_processed: 0,
                completed_at: new Date().toISOString()
            });
            return { success: true, processed: 0, nextCursor };
        }

        // STEP 2: Get full details via bulk
        const bulkResp = await fetch(`${VIATOR_API_BASE}/products/bulk`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'exp-api-key': VIATOR_API_KEY!,
                'Accept-Language': 'en',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productCodes: activeCodes, currency: 'EUR' })
        });

        if (!bulkResp.ok) throw new Error(`Bulk API error: ${bulkResp.status}`);

        const bulkData = await bulkResp.json();
        const products = bulkData.products || [];

        // STEP 3: Upsert to DB
        if (products.length > 0) {
            const upsertData = products.map((p: any) => ({
                product_code: p.productCode,
                title: p.title,
                description: p.description,
                pricing: p.pricing,
                images: p.images,
                reviews: p.reviews,
                duration: p.duration,
                destinations: p.destinations,
                tags: p.tags,
                product_url: p.productUrl,
                status: 'ACTIVE',
                viator_modified_at: modProducts.find((m: any) => m.productCode === p.productCode)?.lastUpdatedAt,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('products')
                .upsert(upsertData, { onConflict: 'product_code' });

            if (error) throw new Error(`Supabase error: ${error.message}`);
        }

        // Log success
        await supabase.from('viator_ingestion_log').insert({
            entity_type: 'products',
            last_cursor: nextCursor,
            status: 'completed',
            items_processed: products.length,
            completed_at: new Date().toISOString()
        });

        return { success: true, processed: products.length, nextCursor };

    } catch (error: any) {
        await supabase.from('viator_ingestion_log').insert({
            entity_type: 'products',
            last_cursor: cursor,
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
        });
        return { success: false, processed: 0, error: error.message };
    }
}

// Placeholder functions (availability & bookings not changed)
export async function ingestAvailability(): Promise<IngestionResult> {
    return { success: true, processed: 0 };
}

export async function ingestBookings(): Promise<IngestionResult> {
    return { success: true, processed: 0 };
}
