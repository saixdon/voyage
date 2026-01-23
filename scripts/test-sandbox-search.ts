
import 'dotenv/config';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

if (!VIATOR_API_KEY) {
    console.error("Error: VIATOR_API_KEY is not set.");
    process.exit(1);
}

async function testSearch(query: string, destId?: number) {
    console.log(`\nTesting Search for: "${query}" (DestID: ${destId || 'auto'})...`);
    console.log(`URL: ${VIATOR_API_BASE}/products/search`);

    const body = {
        searchTerm: query,
        pagination: { start: 1, count: 5 },
        currency: "EUR",
        sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
        filtering: destId ? { destination: destId.toString() } : undefined
    };

    try {
        const response = await fetch(`${VIATOR_API_BASE}/products/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'Content-Type': 'application/json',
                'exp-api-key': VIATOR_API_KEY!,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Body:", text);
            return;
        }

        const data = await response.json();
        console.log(`Result Count: ${data.totalCount}`);
        if (data.products) {
            data.products.forEach((p: any) => {
                console.log(`- [${p.productCode}] ${p.title} (${p.destinations?.[0]?.name})`);
            });
        } else {
            console.log("No products array in response.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

async function run() {
    // Test 1: Known generic search
    await testSearch("tour");

    // Test 2: Specific Destination (Las Vegas is usually in Sandbox)
    // ID 684 = USA? Let's try without ID first or with a known ID if possible.
    // Let's try 'Las Vegas' text search
    await testSearch("Las Vegas");

    // Test 3: Paris (ID 479)
    await testSearch("Paris", 479);
}

run();
