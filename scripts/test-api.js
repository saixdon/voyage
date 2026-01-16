const VIATOR_API_KEY = 'fad9e3c8-ecad-446a-81fb-40281a8e3334';
const BASE_URL = 'https://api.sandbox.viator.com/partner';

async function testDestinations() {
    console.log("Testing Viator API /destinations...");

    const url = `${BASE_URL}/destinations`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'exp-api-key': VIATOR_API_KEY
            }
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log("Data:", JSON.stringify(data, null, 2).substring(0, 1000));
    } catch (err) {
        console.error("Error:", err);
    }
}

testDestinations();
