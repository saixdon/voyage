
const GYG_API_BASE = "https://api.getyourguide.com/partner/v1";
const GYG_USERNAME = "TripVega"; // Hardcoded for test
const GYG_PASSWORD = "7a381076927e62da453ee16d24c052df";

function getAuthHeader() {
    const credentials = Buffer.from(`${GYG_USERNAME}:${GYG_PASSWORD}`).toString("base64");
    return `Basic ${credentials}`;
}

async function testGyg() {
    const url = `${GYG_API_BASE}/activities?q=Paris&limit=1`;
    console.log("Testing URL:", url);

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": getAuthHeader(),
                "Accept": "application/json",
                "X-API-Key": GYG_PASSWORD // Sometimes GYG uses X-API-Key instead of Basic?? PRD said X-API-Key?
            }
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text.substring(0, 500));
    } catch (e) {
        console.error("Failed:", e);
    }
}

// Let's also check what the PRD said exactly about Auth
// PRD said: 
// Headers:
//   X-API-Key: {YOUR_PARTNER_API_KEY}
//   Content-Type: application/json
// 
// It did NOT mention Basic Auth.
// It also mentioned "partner/v1".

async function testGygApiKey() {
    console.log("\nTesting with X-API-Key header only...");
    const url = `${GYG_API_BASE}/activities?q=Paris&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                "X-API-Key": GYG_PASSWORD, // Assuming password is the key? Or maybe Username is the key?
                // Usually "TripVega" is a name, "7a..." is the key.
                "Accept": "application/json",
            }
        });

        console.log("Status:", response.status);
        console.log("Body:", (await response.text()).substring(0, 500));
    } catch (e) {
        console.error("Failed:", e);
    }
}

async function run() {
    await testGyg();
    await testGygApiKey();
}

run();
