
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

async function fetchExchangeRates() {
    // Viator exchange-rates endpoint requires POST with source currency
    const response = await fetch(`${VIATOR_API_BASE}/exchange-rates`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;version=2.0',
            'Content-Type': 'application/json',
            'exp-api-key': VIATOR_API_KEY!,
        },
        body: JSON.stringify({
            sourceCurrency: 'EUR'
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

async function syncExchangeRates() {
    console.log("Starting Exchange Rates Sync...");

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    let loadId: string | null = null;

    try {
        // Create SyncLog
        const logRes = await client.query(`
            INSERT INTO public.sync_logs (sync_type, status)
            VALUES ($1, $2)
            RETURNING id
        `, ['EXCHANGE_RATES', 'RUNNING']);
        loadId = logRes.rows[0].id;

        console.log("Fetching exchange rates from Viator API...");
        const data: any = await fetchExchangeRates();

        const rates = data.rates || data.exchangeRates;
        if (!rates || rates.length === 0) {
            console.log("No exchange rates found in API response.");
            await client.query(`
                UPDATE public.sync_logs 
                SET status = 'SUCCESS', completed_at = NOW(), items_processed = 0
                WHERE id = $1
            `, [loadId]);
            return;
        }

        console.log(`Processing ${rates.length} exchange rates...`);

        for (const r of rates) {
            // Parse validity timestamps
            const validFrom = r.validFrom ? new Date(r.validFrom) : new Date();
            const validUntil = r.validUntil ? new Date(r.validUntil) : new Date(Date.now() + 24 * 60 * 60 * 1000);

            await client.query(`
                INSERT INTO public.exchange_rates (
                    source_currency, target_currency, rate,
                    valid_from, valid_until, synced_at
                )
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT (source_currency, target_currency, valid_from) DO UPDATE SET
                    rate = EXCLUDED.rate,
                    valid_until = EXCLUDED.valid_until,
                    synced_at = NOW()
            `, [
                r.sourceCurrency || r.from,
                r.targetCurrency || r.to,
                r.rate,
                validFrom,
                validUntil
            ]);
        }

        // Success
        await client.query(`
            UPDATE public.sync_logs 
            SET status = 'SUCCESS', completed_at = NOW(), items_processed = $1
            WHERE id = $2
        `, [rates.length, loadId]);

        console.log(`Exchange Rates Sync Complete. Processed: ${rates.length}`);

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

syncExchangeRates();
