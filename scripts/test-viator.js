const fs = require('fs');
const path = require('path');
process.env.VIATOR_API_KEY = 'fad9e3c8-ecad-446a-81fb-40281a8e3334';
const BAS_URL = 'https://api.viator.com/partner';

async function run() {
    console.log(`Checking endpoints to find destinations...`);

    // 1. Try /destinations (GET) to see if it lists root
    await testGet('/destinations');

    // 2. Try /search/freetext again but simpler?
    await testPost('/search/freetext', {
        searchTerm: "Paris",
        searchTypes: ["DESTINATIONS"],
        currency: "EUR"
    });
}

async function testGet(endpoint) {
    console.log(`\n--- GET ${endpoint} ---`);
    try {
        const response = await fetch(BAS_URL + endpoint, {
            method: "GET",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": "en",
                "exp-api-key": process.env.VIATOR_API_KEY,
            }
        });
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Body: ${text.substring(0, 300)}`);
    } catch (e) { console.error(e); }
}

async function testPost(endpoint, body) {
    console.log(`\n--- POST ${endpoint} ---`);
    try {
        const response = await fetch(BAS_URL + endpoint, {
            method: "POST",
            headers: {
                "Accept": "application/json;version=2.0",
                "Accept-Language": "en",
                "exp-api-key": process.env.VIATOR_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Body: ${text.substring(0, 300)}`);
    } catch (e) { console.error(e); }
}

run();
