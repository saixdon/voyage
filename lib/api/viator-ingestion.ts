
import { createClient } from '@/lib/supabase/server';
import { getViatorProductDetails } from './viator-client';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

// Interfaces for response types
interface IngestionResult {
    success: boolean;
    processed: number;
    error?: string;
    nextCursor?: string;
}

/**
 * Fetches products modified since proper cursor and updates Supabase
 */
export async function ingestProducts(): Promise<IngestionResult> {
    const supabase = await createClient();

    // 1. Get last cursor from log
    const { data: logEntry } = await supabase
        .from('viator_ingestion_log')
        .select('last_cursor')
        .eq('entity_type', 'products')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    const cursor = logEntry?.last_cursor;

    // 2. Call Viator API
    try {
        const requestBody: any = {
            count: 50, // Batch size
            currency: 'EUR'
        };

        if (cursor) {
            requestBody.cursor = cursor;
        }

        const response = await fetch(`${VIATOR_API_BASE}/products/modified-since`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'exp-api-key': VIATOR_API_KEY!,
                'Accept-Language': 'en',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`Viator API error: ${response.status}`);

        const data = await response.json();
        const products = data.products || [];
        const nextCursor = data.nextCursor;

        // 3. Upsert products to Supabase
        let processedCount = 0;

        if (products.length > 0) {
            // Transform for DB
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
                status: p.status || 'ACTIVE',
                viator_modified_at: p.lastUpdated,
                updated_at: new Date().toISOString()
            }));

            const { error: upsertError } = await supabase
                .from('products')
                .upsert(upsertData, { onConflict: 'product_code' });

            if (upsertError) throw new Error(`Supabase upsert error: ${upsertError.message}`);
            processedCount = products.length;
        }

        // 4. Log successful run
        await supabase.from('viator_ingestion_log').insert({
            entity_type: 'products',
            last_cursor: nextCursor, // Store next cursor for next run
            status: 'completed',
            items_processed: processedCount,
            completed_at: new Date().toISOString()
        });

        return { success: true, processed: processedCount, nextCursor };

    } catch (error: any) {
        console.error('Ingestion failed:', error);

        // Log failure
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

/**
 * Fetches availability schedules modified since cursor
 */
export async function ingestAvailability(): Promise<IngestionResult> {
    const supabase = await createClient();

    // 1. Get last cursor
    const { data: logEntry } = await supabase
        .from('viator_ingestion_log')
        .select('last_cursor')
        .eq('entity_type', 'availability')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    const cursor = logEntry?.last_cursor;

    try {
        const requestBody: any = {
            count: 50,
            currency: 'EUR'
        };

        if (cursor) {
            requestBody.cursor = cursor;
        }

        const response = await fetch(`${VIATOR_API_BASE}/availability/schedules/modified-since`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'exp-api-key': VIATOR_API_KEY!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`Viator API error: ${response.status}`);

        const data = await response.json();
        const schedules = data.availabilitySchedules || [];
        const nextCursor = data.nextCursor;

        // 3. Upsert to DB
        let processedCount = 0;
        if (schedules.length > 0) {
            const upsertData = schedules.map((s: any) => ({
                product_code: s.productCode,
                schedule_data: s,
                viator_modified_at: new Date().toISOString(), // API doesn't always give timestamp here
                fetched_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('viator_availability_schedules')
                .upsert(upsertData, { onConflict: 'product_code' });

            if (error) throw new Error(`Supabase error: ${error.message}`);
            processedCount = schedules.length;
        }

        // 4. Log
        await supabase.from('viator_ingestion_log').insert({
            entity_type: 'availability',
            last_cursor: nextCursor,
            status: 'completed',
            items_processed: processedCount,
            completed_at: new Date().toISOString()
        });

        return { success: true, processed: processedCount, nextCursor };

    } catch (error: any) {
        await supabase.from('viator_ingestion_log').insert({
            entity_type: 'availability',
            last_cursor: cursor,
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
        });
        return { success: false, processed: 0, error: error.message };
    }
}

/**
 * Fetches bookings modified since cursor
 */
export async function ingestBookings(): Promise<IngestionResult> {
    const supabase = await createClient();

    // 1. Get last cursor
    const { data: logEntry } = await supabase
        .from('viator_ingestion_log')
        .select('last_cursor')
        .eq('entity_type', 'bookings')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    const cursor = logEntry?.last_cursor;

    try {
        const requestBody: any = {
            count: 50
        };

        if (cursor) {
            requestBody.cursor = cursor;
        }

        const response = await fetch(`${VIATOR_API_BASE}/bookings/modified-since`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'exp-api-key': VIATOR_API_KEY!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`Viator API error: ${response.status}`);

        const data = await response.json();
        const bookings = data.bookings || [];
        const nextCursor = data.nextCursor;

        // 3. Update local bookings if they exist
        // Note: We only update if we have the booking locally, we don't ingest ALL bookings
        let processedCount = 0;

        if (bookings.length > 0) {
            for (const booking of bookings) {
                // Update local booking status
                // Assumes we have a 'bookings' table from previous work
                const status = booking.status; // e.g. CONFIRMED, CANCELLED, REJECTED

                if (status) {
                    await supabase
                        .from('bookings')
                        .update({ status: status, viator_modified_at: new Date().toISOString() })
                        .eq('partner_booking_ref', booking.bookingRef);
                    processedCount++;
                }
            }
        }

        // 4. Log
        await supabase.from('viator_ingestion_log').insert({
            entity_type: 'bookings',
            last_cursor: nextCursor,
            status: 'completed',
            items_processed: processedCount,
            completed_at: new Date().toISOString()
        });

        return { success: true, processed: processedCount, nextCursor };

    } catch (error: any) {
        await supabase.from('viator_ingestion_log').insert({
            entity_type: 'bookings',
            last_cursor: cursor,
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
        });
        return { success: false, processed: 0, error: error.message };
    }
}
