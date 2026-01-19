
// require('dotenv').config();

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const VIATOR_PROD_URL = "https://api.viator.com/partner";
const VIATOR_SANDBOX_URL = "https://api.sandbox.viator.com/partner";

console.log("Checking Viator Connectivity...");
console.log("API Key loaded:", VIATOR_API_KEY ? "Yes (starts with " + VIATOR_API_KEY.substring(0, 4) + ")" : "No");

async function check(baseUrl, name) {
    console.log(`\nTesting ${name} (${baseUrl})...`);
    try {
        const url = `${baseUrl}/destinations`;
        console.log(`GET ${url}`);
        const response = await fetch(url, {
            headers: {
                "Accept": "application/json;version=2.0",
                "exp-api-key": VIATOR_API_KEY,
                "Accept-Language": "en"
            }
        });

        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`SUCCESS! Destinations found: ${data.destinations?.length}`);
            return true;
        } else {
            console.log(`FAILED. Error:`, await response.text());
            return false;
        }
    } catch (e) {
        console.error(`EXCEPTION connecting to ${name}:`, e.message);
        return false;
    }
}

async function run() {
    console.log("1. Checking Sandbox...");
    await check(VIATOR_SANDBOX_URL, "Sandbox");

    console.log("\n2. Checking Production...");
    await check(VIATOR_PROD_URL, "Production");
}

run();
