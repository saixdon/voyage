
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

async function fetchProductsModifiedSince(cursor?: string) {
    const url = new URL(`${VIATOR_API_BASE}/products/modified-since`);
    url.searchParams.append('count', '500');
    if (cursor) {
        url.searchParams.append('cursor', cursor);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Accept': 'application/json;version=2.0',
            'exp-api-key': VIATOR_API_KEY!,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

async function syncProducts() {
    console.log("Starting Product Sync (Raw SQL)...");

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    let loadId: string | null = null;

    try {
        // Create SyncLog
        const logRes = await client.query(`
      INSERT INTO public.sync_logs (sync_type, status)
      VALUES ($1, $2)
      RETURNING id
    `, ['PRODUCTS', 'RUNNING']);
        loadId = logRes.rows[0].id;

        let cursor: string | undefined = undefined;
        let totalProcessed = 0;
        let hasMore = true;

        while (hasMore) {
            console.log(`Fetching batch... (Cursor: ${cursor || 'START'})`);
            const data: any = await fetchProductsModifiedSince(cursor);

            const products = data.products;
            if (!products || products.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`Processing ${products.length} products...`);

            for (const p of products) {
                // Upsert Product
                // Note: snake_case column names based on schema
                await client.query(`
          INSERT INTO public.products (
            product_code, title, description, status,
            viator_updated_at, price_from, currency,
            destination_id, primary_image, images,
            rating, review_count, duration, synced_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
          ON CONFLICT (product_code) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            viator_updated_at = EXCLUDED.viator_updated_at,
            price_from = EXCLUDED.price_from,
            currency = EXCLUDED.currency,
            destination_id = EXCLUDED.destination_id,
            primary_image = EXCLUDED.primary_image,
            images = EXCLUDED.images,
            rating = EXCLUDED.rating,
            review_count = EXCLUDED.review_count,
            duration = EXCLUDED.duration,
            synced_at = NOW()
        `, [
                    p.productCode,
                    p.title,
                    p.description,
                    p.status,
                    p.lastUpdated ? new Date(p.lastUpdated) : new Date(),
                    p.pricing?.summary?.fromPrice,
                    p.pricing?.currency || 'EUR',
                    p.destinations?.[0]?.ref ? parseInt(p.destinations[0].ref) : null,
                    p.images?.[0]?.variants?.find((v: any) => v.width >= 720)?.url || p.images?.[0]?.variants?.[0]?.url,
                    JSON.stringify(p.images || []),
                    p.reviews?.combinedAverageRating,
                    p.reviews?.totalReviews || 0,
                    p.duration?.fixedDurationInMinutes ? `${p.duration.fixedDurationInMinutes}m` : null
                ]);
            }

            totalProcessed += products.length;
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

        console.log(`Sync Complete. Processed: ${totalProcessed}`);

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

syncProducts();
