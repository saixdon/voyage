require('dotenv').config();
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const VIATOR_API_BASE = "https://api.sandbox.viator.com/partner";

async function testViator() {
    console.log("Testing Viator API...");
    console.log("Key:", VIATOR_API_KEY);

    // Test 1: Destinations (Simple GET)
    try {
        const url = `${VIATOR_API_BASE}/destinations`;
        console.log(`\nGET ${url}`);
        const response = await fetch(url, {
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": VIATOR_API_KEY,
                "Accept-Language": "en"
            }
        });

        console.log("Status:", response.status);
        if (!response.ok) {
            console.log("Error Body:", await response.text());
        } else {
            const data = await response.json();
            console.log("Success! Destinations found:", data.destinations?.length);
        }
    } catch (e) {
        console.error("Test 1 Failed:", e);
    }

    // Test 2: Search (POST) - This is what the search page uses
    try {
        const url = `${VIATOR_API_BASE}/products/search`;
        console.log(`\nPOST ${url}`);

        // We need a destination ID for search usually, but let's try a broad search if possible or use a known one (e.g. Paris ~ 479)
        // If Test 1 fails, this will likely fail too.
        const body = {
            searchTerm: "Food",
            pagination: { start: 1, count: 1 },
            currency: "EUR"
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": VIATOR_API_KEY,
                "Content-Type": "application/json",
                "Accept-Language": "en"
            },
            body: JSON.stringify(body)
        });

        console.log("Status:", response.status);
        if (!response.ok) {
            console.log("Error Body:", await response.text());
        } else {
            console.log("Success! Search executed.");
        }

    } catch (e) {
        console.error("Test 2 Failed:", e);
    }
}

testViator();
