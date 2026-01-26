/**
 * Viator Product Ingestion (Corrected Two-Step Process)
 * 
 * Step 1: /products/modified-since → Get list of changed product codes
 * Step 2: /products/bulk → Get full product details
 * 
 * Multi-Language Support:
 * - English is the primary language (stored in `title`, `description`)
 * - Other languages stored in `titles_by_locale`, `descriptions_by_locale`
 */

import { createClient } from '@/lib/supabase/server';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

// Supported locales for ingestion
export const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'ja'];

interface IngestionResult {
    success: boolean;
    processed: number;
    error?: string;
    nextCursor?: string;
    locale?: string;
}

/**
 * Main ingestion function - handles English (primary) data
 */
export async function ingestProducts(locale: string = 'en'): Promise<IngestionResult> {
    const supabase = await createClient();
    const entityType = locale === 'en' ? 'products' : `products_${locale}`;

    // 1. Get last cursor for this locale
    const { data: logEntry } = await supabase
        .from('viator_ingestion_log')
        .select('last_cursor')
        .eq('entity_type', entityType)
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
                    'Accept-Language': locale
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
                entity_type: entityType,
                locale: locale,
                last_cursor: nextCursor,
                status: 'completed',
                items_processed: 0,
                completed_at: new Date().toISOString()
            });
            return { success: true, processed: 0, nextCursor, locale };
        }

        // STEP 2: Get full details via bulk (with locale)
        const bulkResp = await fetch(`${VIATOR_API_BASE}/products/bulk`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'exp-api-key': VIATOR_API_KEY!,
                'Accept-Language': locale,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productCodes: activeCodes, currency: 'EUR' })
        });

        if (!bulkResp.ok) throw new Error(`Bulk API error: ${bulkResp.status}`);

        const bulkData = await bulkResp.json();
        const products = bulkData.products || [];

        // STEP 3: Upsert to DB (different handling for EN vs other locales)
        if (products.length > 0) {
            if (locale === 'en') {
                // English: Full upsert with all fields
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
                    titles_by_locale: { en: p.title },
                    descriptions_by_locale: { en: p.description },
                    viator_modified_at: modProducts.find((m: any) => m.productCode === p.productCode)?.lastUpdatedAt,
                    updated_at: new Date().toISOString()
                }));

                const { error } = await supabase
                    .from('products')
                    .upsert(upsertData, { onConflict: 'product_code' });

                if (error) throw new Error(`Supabase error: ${error.message}`);
            } else {
                // Non-English: Update only the localized title/description
                for (const p of products) {
                    const { data: existing } = await supabase
                        .from('products')
                        .select('titles_by_locale, descriptions_by_locale')
                        .eq('product_code', p.productCode)
                        .single();

                    if (existing) {
                        const updatedTitles = {
                            ...(existing.titles_by_locale || {}),
                            [locale]: p.title
                        };
                        const updatedDescriptions = {
                            ...(existing.descriptions_by_locale || {}),
                            [locale]: p.description
                        };

                        await supabase
                            .from('products')
                            .update({
                                titles_by_locale: updatedTitles,
                                descriptions_by_locale: updatedDescriptions,
                                updated_at: new Date().toISOString()
                            })
                            .eq('product_code', p.productCode);
                    }
                }
            }
        }

        // Log success
        await supabase.from('viator_ingestion_log').insert({
            entity_type: entityType,
            locale: locale,
            last_cursor: nextCursor,
            status: 'completed',
            items_processed: products.length,
            completed_at: new Date().toISOString()
        });

        return { success: true, processed: products.length, nextCursor, locale };

    } catch (error: any) {
        await supabase.from('viator_ingestion_log').insert({
            entity_type: entityType,
            locale: locale,
            last_cursor: cursor,
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
        });
        return { success: false, processed: 0, error: error.message, locale };
    }
}

/**
 * Ingest products for ALL supported locales
 */
export async function ingestProductsAllLocales(): Promise<{ results: IngestionResult[] }> {
    const results: IngestionResult[] = [];

    for (const locale of SUPPORTED_LOCALES) {
        console.log(`Ingesting products for locale: ${locale}`);
        const result = await ingestProducts(locale);
        results.push(result);

        // Small delay between locales to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { results };
}

// Placeholder functions (availability & bookings not changed)
export async function ingestAvailability(): Promise<IngestionResult> {
    return { success: true, processed: 0 };
}

export async function ingestBookings(): Promise<IngestionResult> {
    return { success: true, processed: 0 };
}

