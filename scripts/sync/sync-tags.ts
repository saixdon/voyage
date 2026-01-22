
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

async function fetchTags() {
    const response = await fetch(`${VIATOR_API_BASE}/products/tags`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json;version=2.0',
            'exp-api-key': VIATOR_API_KEY!,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

async function syncTags() {
    console.log("Starting Tags Sync...");

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    let loadId: string | null = null;

    try {
        // Create SyncLog
        const logRes = await client.query(`
            INSERT INTO public.sync_logs (sync_type, status)
            VALUES ($1, $2)
            RETURNING id
        `, ['TAGS', 'RUNNING']);
        loadId = logRes.rows[0].id;

        console.log("Fetching tags from Viator API...");
        const data: any = await fetchTags();

        const tags = data.tags;
        if (!tags || tags.length === 0) {
            console.log("No tags found in API response.");
            await client.query(`
                UPDATE public.sync_logs 
                SET status = 'SUCCESS', completed_at = NOW(), items_processed = 0
                WHERE id = $1
            `, [loadId]);
            return;
        }

        console.log(`Processing ${tags.length} tags...`);

        for (const t of tags) {
            // Get the English name or first available name
            const tagName = t.allNamesByLocale?.en || t.allNamesByLocale?.de || Object.values(t.allNamesByLocale || {})[0] || 'Unknown';

            await client.query(`
                INSERT INTO public.tags (
                    tag_id, tag_name, parent_tag_id, synced_at
                )
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (tag_id) DO UPDATE SET
                    tag_name = EXCLUDED.tag_name,
                    parent_tag_id = EXCLUDED.parent_tag_id,
                    synced_at = NOW()
            `, [
                t.tagId,
                tagName,
                t.parentTagIds?.[0] || null
            ]);
        }

        // Success
        await client.query(`
            UPDATE public.sync_logs 
            SET status = 'SUCCESS', completed_at = NOW(), items_processed = $1
            WHERE id = $2
        `, [tags.length, loadId]);

        console.log(`Tags Sync Complete. Processed: ${tags.length}`);

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

syncTags();
