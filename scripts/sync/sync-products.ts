
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
            'Accept-Language': 'en',
            'exp-api-key': VIATOR_API_KEY!,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

// Fetch full product details using /products/bulk endpoint
async function fetchProductDetails(productCodes: string[]) {
    // console.log(`Fetching details for ${productCodes.slice(0, 3)}...`);
    const response = await fetch(`${VIATOR_API_BASE}/products/bulk`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en',
            'Content-Type': 'application/json',
            'exp-api-key': VIATOR_API_KEY!,
        },
        body: JSON.stringify({ productCodes }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Bulk fetch failed: ${response.status} - ${errorText}`);
        return { products: [] };
    }

    const data = await response.json();
    // Debug: check if products are returned
    if (!data.products || data.products.length === 0) {
        console.warn(`Bulk API 200 OK but returned 0 products. Request size: ${productCodes.length}`);
        // console.log("Sample requested codes:", productCodes.slice(0, 5));
    }
    return data;
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

            const summaryProducts = data.products;
            if (!summaryProducts || summaryProducts.length === 0) {
                hasMore = false;
                break;
            }


            // Separate active and inactive products
            const activeProducts = summaryProducts.filter((p: any) => p.status === 'ACTIVE');
            const inactiveProducts = summaryProducts.filter((p: any) => p.status === 'INACTIVE');

            console.log(`Batch summary: ${activeProducts.length} ACTIVE, ${inactiveProducts.length} INACTIVE`);

            if (activeProducts.length === 0) {
                console.log("No active products in this batch, continuing...");
                // Update cursor and continue
                totalProcessed += summaryProducts.length; // Approximate count
                cursor = data.nextCursor;

                // Update log to show progress even if skipping
                if (loadId) {
                    await client.query(`
                        UPDATE public.sync_logs 
                        SET items_processed = $1, cursor = $2 
                        WHERE id = $3
                    `, [totalProcessed, cursor, loadId]);
                }

                if (!cursor) hasMore = false;
                continue;
            }

            // Get product codes for bulk fetch (only ACTIVE)
            const productCodes = activeProducts.map((p: any) => p.productCode);
            console.log(`Fetching full details for ${productCodes.length} ACTIVE products...`);

            // Fetch full product details in batches of 50
            const BATCH_SIZE = 50;
            for (let i = 0; i < productCodes.length; i += BATCH_SIZE) {
                const batch = productCodes.slice(i, i + BATCH_SIZE);
                const fullData = await fetchProductDetails(batch);

                if (!fullData.products || fullData.products.length === 0) {
                    console.log(`No full data for batch ${i / BATCH_SIZE + 1} (Request size: ${batch.length})`);
                    continue;
                }

                console.log(`Processing ${fullData.products.length} products with full data...`);

                for (const p of fullData.products) {
                    // Skip if no title (required field)
                    if (!p.title) {
                        console.log(`Skipping ${p.productCode} - no title`);
                        continue;
                    }

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
                        p.description || '',
                        p.status || 'ACTIVE',
                        p.lastUpdatedAt ? new Date(p.lastUpdatedAt) : new Date(),
                        p.pricing?.summary?.fromPrice || null,
                        p.pricing?.currency || 'EUR',
                        p.destinations?.[0]?.ref ? parseInt(p.destinations[0].ref) : null,
                        p.images?.[0]?.variants?.find((v: any) => v.width >= 720)?.url || p.images?.[0]?.variants?.[0]?.url || null,
                        JSON.stringify(p.images || []),
                        p.reviews?.combinedAverageRating || null,
                        p.reviews?.totalReviews || 0,
                        p.duration?.fixedDurationInMinutes ? `${p.duration.fixedDurationInMinutes}m` : null
                    ]);
                    totalProcessed++;
                }
            }

            totalProcessed += summaryProducts.length;
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
