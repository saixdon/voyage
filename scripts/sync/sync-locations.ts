
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

async function fetchLocationsBulk(locationRefs: string[]) {
    const response = await fetch(`${VIATOR_API_BASE}/locations/bulk`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en',
            'Content-Type': 'application/json',
            'exp-api-key': VIATOR_API_KEY!,
        },
        body: JSON.stringify({ locations: locationRefs.map(ref => ({ ref })) }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

async function syncLocations() {
    console.log("Starting Locations Sync...");

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    let loadId: string | null = null;

    try {
        // Create SyncLog
        const logRes = await client.query(`
            INSERT INTO public.sync_logs (sync_type, status)
            VALUES ($1, $2)
            RETURNING id
        `, ['LOCATIONS', 'RUNNING']);
        loadId = logRes.rows[0].id;

        // Get unique location refs from products
        console.log("Fetching location refs from products...");
        const productsRes = await client.query(`
            SELECT DISTINCT jsonb_array_elements(
                CASE 
                    WHEN images IS NOT NULL AND images != '[]' 
                    THEN images 
                    ELSE '[]'::jsonb 
                END
            )->>'locationRef' as location_ref
            FROM public.products
            WHERE status = 'ACTIVE'
            LIMIT 500
        `);

        // For now, let's use some common location refs or get them from destinations
        const destinationsRes = await client.query(`
            SELECT destination_id::text as ref FROM public.destinations LIMIT 100
        `);

        const locationRefs = destinationsRes.rows
            .map((r: any) => r.ref)
            .filter((ref: string) => ref);

        if (locationRefs.length === 0) {
            console.log("No location refs found. Skipping sync.");
            await client.query(`
                UPDATE public.sync_logs 
                SET status = 'SUCCESS', completed_at = NOW(), items_processed = 0
                WHERE id = $1
            `, [loadId]);
            return;
        }

        console.log(`Fetching details for ${locationRefs.length} locations...`);

        // Fetch in batches of 50
        const BATCH_SIZE = 50;
        let totalProcessed = 0;

        for (let i = 0; i < locationRefs.length; i += BATCH_SIZE) {
            const batch = locationRefs.slice(i, i + BATCH_SIZE);

            try {
                const data = await fetchLocationsBulk(batch);

                if (data.locations && data.locations.length > 0) {
                    for (const loc of data.locations) {
                        await client.query(`
                            INSERT INTO public.locations (
                                location_ref, name, address, 
                                latitude, longitude, city,
                                country, synced_at
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                            ON CONFLICT (location_ref) DO UPDATE SET
                                name = EXCLUDED.name,
                                address = EXCLUDED.address,
                                latitude = EXCLUDED.latitude,
                                longitude = EXCLUDED.longitude,
                                city = EXCLUDED.city,
                                country = EXCLUDED.country,
                                synced_at = NOW()
                        `, [
                            loc.ref,
                            loc.name || null,
                            loc.address || null,
                            loc.center?.latitude || null,
                            loc.center?.longitude || null,
                            loc.city || null,
                            loc.country || null
                        ]);
                        totalProcessed++;
                    }
                }
            } catch (batchError) {
                console.error(`Error fetching batch ${i / BATCH_SIZE + 1}:`, batchError);
            }
        }

        // Success
        await client.query(`
            UPDATE public.sync_logs 
            SET status = 'SUCCESS', completed_at = NOW(), items_processed = $1
            WHERE id = $2
        `, [totalProcessed, loadId]);

        console.log(`Locations Sync Complete. Processed: ${totalProcessed}`);

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

syncLocations();
