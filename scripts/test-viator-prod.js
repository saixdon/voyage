const VIATOR_API_KEY = 'fad9e3c8-ecad-446a-81fb-40281a8e3334';
const BASE_URL = 'https://api.viator.com/partner'; // Production URL

async function testProduction() {
    console.log("Testing Viator Production API...");

    // Try to search for products in a known destination (e.g., London)
    // Using v2.0 endpoint structure
    const url = `${BASE_URL}/search/freetext`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en-US',
                'exp-api-key': VIATOR_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchTerm: "London",
                searchTypes: [
                    {
                        searchType: "PRODUCTS",
                        pagination: {
                            start: 1,
                            count: 1
                        }
                    }
                ],
                currency: "EUR"
            })
        });

        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log("Success! Data preview:", JSON.stringify(data, null, 2).substring(0, 500));
        } else {
            const text = await response.text();
            console.log("Error Body:", text.substring(0, 500));
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

testProduction();
