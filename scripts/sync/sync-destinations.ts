
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

async function fetchDestinations() {
    const response = await fetch(`${VIATOR_API_BASE}/destinations`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json;version=2.0',
            'exp-api-key': VIATOR_API_KEY!,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch destinations: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

async function syncDestinations() {
    console.log("Starting Destinations Sync...");

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    let loadId: string | null = null;

    try {
        // Create SyncLog
        const logRes = await client.query(`
            INSERT INTO public.sync_logs (sync_type, status)
            VALUES ($1, $2)
            RETURNING id
        `, ['DESTINATIONS', 'RUNNING']);
        loadId = logRes.rows[0].id;

        console.log("Fetching destinations from Viator API...");
        const data: any = await fetchDestinations();

        const destinations = data.destinations;
        if (!destinations || destinations.length === 0) {
            console.log("No destinations found in API response.");
            await client.query(`
                UPDATE public.sync_logs 
                SET status = 'SUCCESS', completed_at = NOW(), items_processed = 0
                WHERE id = $1
            `, [loadId]);
            return;
        }

        console.log(`Processing ${destinations.length} destinations...`);

        for (const d of destinations) {
            await client.query(`
                INSERT INTO public.destinations (
                    destination_id, name, destination_type, parent_id, 
                    country_code, timezone, synced_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (destination_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    destination_type = EXCLUDED.destination_type,
                    parent_id = EXCLUDED.parent_id,
                    country_code = EXCLUDED.country_code,
                    timezone = EXCLUDED.timezone,
                    synced_at = NOW()
            `, [
                d.destinationId,
                d.name || d.destinationName,
                d.type || d.destinationType || 'UNKNOWN',
                d.parentId || null,
                d.iataCode || null,
                d.timeZone || null
            ]);
        }

        // Success
        await client.query(`
            UPDATE public.sync_logs 
            SET status = 'SUCCESS', completed_at = NOW(), items_processed = $1
            WHERE id = $2
        `, [destinations.length, loadId]);

        console.log(`Destinations Sync Complete. Processed: ${destinations.length}`);

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

syncDestinations();
