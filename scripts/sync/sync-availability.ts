
import { Client } from 'pg';
import 'dotenv/config';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!VIATOR_API_KEY) {
    console.error("Error: VIATOR_API_KEY is not set.");
    process.exit(1);
}

if (!DATABASE_URL) {
    console.error("Error: DATABASE_URL is not set.");
    process.exit(1);
}

async function fetchAvailabilityModifiedSince(cursor?: string) {
    const url = new URL(`${VIATOR_API_BASE}/availability/schedules/modified-since`);
    url.searchParams.append('count', '500');
    if (cursor) {
        url.searchParams.append('cursor', cursor);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en',
            'exp-api-key': VIATOR_API_KEY!,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch availability: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

async function syncAvailabilitySchedules() {
    console.log("Starting Availability Schedules Sync...");

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    let loadId: string | null = null;

    try {
        // Create SyncLog
        const logRes = await client.query(`
            INSERT INTO public.sync_logs (sync_type, status)
            VALUES ($1, $2)
            RETURNING id
        `, ['AVAILABILITY_SCHEDULES', 'RUNNING']);
        loadId = logRes.rows[0].id;

        let cursor: string | undefined = undefined;
        let totalProcessed = 0;
        let hasMore = true;

        while (hasMore) {
            console.log(`Fetching batch... (Cursor: ${cursor || 'START'})`);
            const data: any = await fetchAvailabilityModifiedSince(cursor);

            const schedules = data.availabilitySchedules;
            if (!schedules || schedules.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`Processing ${schedules.length} availability schedules...`);

            for (const schedule of schedules) {
                // Each schedule contains bookableItems with time slots
                const productCode = schedule.productCode;
                const bookableItems = schedule.bookableItems || [];

                for (const item of bookableItems) {
                    await client.query(`
                        INSERT INTO public.availability_schedules (
                            product_code, product_option_code, travel_date,
                            start_time, available, pricing_record,
                            synced_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, NOW())
                        ON CONFLICT (product_code, product_option_code, travel_date, start_time) 
                        DO UPDATE SET
                            available = EXCLUDED.available,
                            pricing_record = EXCLUDED.pricing_record,
                            synced_at = NOW()
                    `, [
                        productCode,
                        item.productOptionCode || 'DEFAULT',
                        item.travelDate || schedule.travelDate,
                        item.startTime || '00:00',
                        item.available !== false,
                        JSON.stringify(item.pricing || {})
                    ]);
                }
                totalProcessed++;
            }

            cursor = data.nextCursor;
            if (!cursor) hasMore = false;

            // Update log progress
            await client.query(`
                UPDATE public.sync_logs 
                SET items_processed = $1, cursor = $2 
                WHERE id = $3
            `, [totalProcessed, cursor, loadId]);
        }

        // Success
        await client.query(`
            UPDATE public.sync_logs 
            SET status = 'SUCCESS', completed_at = NOW() 
            WHERE id = $1
        `, [loadId]);

        console.log(`Sync Complete. Processed: ${totalProcessed} schedules`);

    } catch (error: any) {
        console.error("Sync Failed:", error);
        if (loadId) {
            await client.query(`
                UPDATE public.sync_logs 
                SET status = 'FAILED', error_message = $1, completed_at = NOW() 
                WHERE id = $2
            `, [error.message, loadId]);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

syncAvailabilitySchedules();
