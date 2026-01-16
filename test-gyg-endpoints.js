
const GYG_USERNAME = "TripVega";
const GYG_PASSWORD = "7a381076927e62da453ee16d24c052df";

function getAuthHeader() {
    const credentials = Buffer.from(`${GYG_USERNAME}:${GYG_PASSWORD}`).toString("base64");
    return `Basic ${credentials}`;
}

async function testUrl(path) {
    const url = `https://api.getyourguide.com/1${path}`;
    console.log(`Testing: ${url}`);
    try {
        const response = await fetch(url, {
            headers: { Authorization: getAuthHeader(), Accept: "application/json" }
        });
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const json = await response.json();
            console.log("Success! Data keys:", Object.keys(json));
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function run() {
    await testUrl("/tours?cnt=1&q=Paris");
    await testUrl("/activities?limit=1&q=Paris");
    await testUrl("/search?q=Paris");
}
run();
