
const GYG_API_BASE = "https://api.getyourguide.com/1";
const GYG_USERNAME = process.env.GYG_INTEGRATOR_USERNAME;
const GYG_PASSWORD = process.env.GYG_INTEGRATOR_PASSWORD;

function getAuthHeader() {
    const credentials = Buffer.from(`${GYG_USERNAME}:${GYG_PASSWORD}`).toString("base64");
    return `Basic ${credentials}`;
}

async function testGyg() {
    console.log("Testing GYG API...");
    console.log("URL:", `${GYG_API_BASE}/activities?q=Sport&limit=1`);
    console.log("Headers:", { Authorization: getAuthHeader() });

    try {
        const response = await fetch(`${GYG_API_BASE}/activities?q=Sport&limit=1`, {
            headers: {
                "Authorization": getAuthHeader(),
                "Accept": "application/json",
            }
        });

        console.log("GYG Status:", response.status);
        const text = await response.text();
        console.log("GYG Body:", text);
    } catch (e) {
        console.error("GYG Failed:", e);
    }
}

const VIATOR_API_BASE = "https://api.sandbox.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

async function testViator() {
    console.log("\nTesting Viator API...");
    console.log("Key:", VIATOR_API_KEY);

    try {
        const response = await fetch(`${VIATOR_API_BASE}/destinations`, {
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": VIATOR_API_KEY,
                "Accept-Language": "en"
            }
        });
        console.log("Viator Destinations Status:", response.status);
        // Don't log full body, it's huge
        if (!response.ok) {
            console.log("Viator Error Body:", await response.text());
        } else {
             const data = await response.json();
             console.log("Viator Destinations Count:", data.destinations?.length);
        }

    } catch (e) {
        console.error("Viator Failed:", e);
    }
}

async function run() {
    await testGyg();
    await testViator();
}

run();
