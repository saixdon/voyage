
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

async function fetchBookingQuestions(productCodes: string[]) {
    const response = await fetch(
        `${VIATOR_API_BASE}/products/booking-questions?productCodes=${productCodes.join(',')}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'exp-api-key': VIATOR_API_KEY!,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch booking questions: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

async function syncBookingQuestions() {
    console.log("Starting Booking Questions Sync...");

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    let loadId: string | null = null;

    try {
        // Create SyncLog
        const logRes = await client.query(`
            INSERT INTO public.sync_logs (sync_type, status)
            VALUES ($1, $2)
            RETURNING id
        `, ['BOOKING_QUESTIONS', 'RUNNING']);
        loadId = logRes.rows[0].id;

        // Get all product codes from DB that need booking questions
        const productsRes = await client.query(`
            SELECT product_code FROM public.products 
            WHERE status = 'ACTIVE'
            LIMIT 100
        `);

        const productCodes = productsRes.rows.map((r: any) => r.product_code);

        if (productCodes.length === 0) {
            console.log("No active products found in DB. Fetching general booking questions...");
            // Fetch general booking questions (without specific product codes)
            const data = await fetchBookingQuestions([]);
            console.log(`Found ${data.bookingQuestions?.length || 0} general booking questions.`);
        } else {
            console.log(`Fetching booking questions for ${productCodes.length} products...`);

            // Fetch in batches of 20
            const BATCH_SIZE = 20;
            let totalQuestions = 0;

            for (let i = 0; i < productCodes.length; i += BATCH_SIZE) {
                const batch = productCodes.slice(i, i + BATCH_SIZE);

                try {
                    const data = await fetchBookingQuestions(batch);

                    if (data.bookingQuestions && data.bookingQuestions.length > 0) {
                        for (const q of data.bookingQuestions) {
                            await client.query(`
                                INSERT INTO public.booking_questions (
                                    question_id, legacy_id, question_type, 
                                    question_group, label, hint,
                                    required, max_length, units, 
                                    allowed_answers, synced_at
                                )
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                                ON CONFLICT (question_id) DO UPDATE SET
                                    legacy_id = EXCLUDED.legacy_id,
                                    question_type = EXCLUDED.question_type,
                                    question_group = EXCLUDED.question_group,
                                    label = EXCLUDED.label,
                                    hint = EXCLUDED.hint,
                                    required = EXCLUDED.required,
                                    max_length = EXCLUDED.max_length,
                                    units = EXCLUDED.units,
                                    allowed_answers = EXCLUDED.allowed_answers,
                                    synced_at = NOW()
                            `, [
                                q.id,
                                q.legacyBookingQuestionId,
                                q.type,
                                q.group,
                                q.label,
                                q.hint || null,
                                q.required,
                                q.maxLength || null,
                                JSON.stringify(q.units || []),
                                JSON.stringify(q.allowedAnswers || [])
                            ]);
                            totalQuestions++;
                        }
                    }
                } catch (batchError) {
                    console.error(`Error fetching batch ${i / BATCH_SIZE + 1}:`, batchError);
                }
            }

            console.log(`Synced ${totalQuestions} booking questions.`);
        }

        // Success
        await client.query(`
            UPDATE public.sync_logs 
            SET status = 'SUCCESS', completed_at = NOW()
            WHERE id = $1
        `, [loadId]);

        console.log("Booking Questions Sync Complete.");

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

syncBookingQuestions();
