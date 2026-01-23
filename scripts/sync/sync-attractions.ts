
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

async function searchAttractions(destinationId: number, start = 1, count = 50) {
    const response = await fetch(`${VIATOR_API_BASE}/attractions/search`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en',
            'Content-Type': 'application/json',
            'exp-api-key': VIATOR_API_KEY!,
        },
        body: JSON.stringify({
            destId: destinationId,
            pagination: { start, count }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to search attractions: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

async function syncAttractions() {
    console.log("Starting Attractions Sync...");

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    let loadId: string | null = null;

    try {
        // Create SyncLog
        const logRes = await client.query(`
            INSERT INTO public.sync_logs (sync_type, status)
            VALUES ($1, $2)
            RETURNING id
        `, ['ATTRACTIONS', 'RUNNING']);
        loadId = logRes.rows[0].id;

        // Get top destinations to search attractions for
        const destinationsRes = await client.query(`
            SELECT destination_id FROM public.destinations 
            WHERE destination_type IN ('CITY', 'REGION')
            ORDER BY destination_id
            LIMIT 50
        `);

        const destinations = destinationsRes.rows;
        console.log(`Fetching attractions for ${destinations.length} destinations...`);

        let totalProcessed = 0;

        for (const dest of destinations) {
            const destinationId = dest.destination_id;

            try {
                console.log(`Fetching attractions for destination ${destinationId}...`);
                const data = await searchAttractions(destinationId);

                const attractions = data.attractions || [];

                for (const attr of attractions) {
                    await client.query(`
                        INSERT INTO public.attractions (
                            attraction_id, seo_id, name, 
                            destination_id, primary_image,
                            rating, review_count, 
                            product_count, description,
                            synced_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                        ON CONFLICT (attraction_id) DO UPDATE SET
                            seo_id = EXCLUDED.seo_id,
                            name = EXCLUDED.name,
                            destination_id = EXCLUDED.destination_id,
                            primary_image = EXCLUDED.primary_image,
                            rating = EXCLUDED.rating,
                            review_count = EXCLUDED.review_count,
                            product_count = EXCLUDED.product_count,
                            description = EXCLUDED.description,
                            synced_at = NOW()
                    `, [
                        attr.attractionId || attr.seoId,
                        attr.seoId,
                        attr.name || attr.title,
                        destinationId,
                        attr.images?.[0]?.variants?.[0]?.url || null,
                        attr.rating?.combinedAverageRating || null,
                        attr.rating?.totalReviews || 0,
                        attr.productCount || 0,
                        attr.description || null
                    ]);
                    totalProcessed++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (destError) {
                console.error(`Error fetching attractions for destination ${destinationId}:`, destError);
            }
        }

        // Success
        await client.query(`
            UPDATE public.sync_logs 
            SET status = 'SUCCESS', completed_at = NOW(), items_processed = $1
            WHERE id = $2
        `, [totalProcessed, loadId]);

        console.log(`Attractions Sync Complete. Processed: ${totalProcessed}`);

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

syncAttractions();
