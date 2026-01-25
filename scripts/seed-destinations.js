/**
 * Seed viator_destinations table
 * Run with: node scripts/seed-destinations.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.sandbox.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedDestinations() {
    console.log('Fetching destinations from Viator...');

    const response = await fetch(`${VIATOR_API_BASE}/destinations`, {
        headers: {
            'Accept': 'application/json;version=2.0',
            'exp-api-key': VIATOR_API_KEY,
            'Accept-Language': 'en'
        }
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const destinations = data.destinations || [];

    console.log(`Got ${destinations.length} destinations`);

    // Upsert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < destinations.length; i += batchSize) {
        const batch = destinations.slice(i, i + batchSize);

        const upsertData = batch.map(d => ({
            destination_id: parseInt(d.destinationId),
            name: d.name,
            type: d.destinationType,
            parent_id: d.parentId ? parseInt(d.parentId) : null,
            names_by_locale: { en: d.name }
        }));

        const { error } = await supabase
            .from('viator_destinations')
            .upsert(upsertData, { onConflict: 'destination_id' });

        if (error) {
            console.error('Upsert error:', error);
            throw error;
        }

        console.log(`✅ Inserted batch ${i / batchSize + 1} (${upsertData.length} destinations)`);
    }

    console.log(`🎉 Total: ${destinations.length} destinations inserted`);
}

seedDestinations().catch(console.error);
