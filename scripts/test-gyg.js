const GYG_USERNAME = 'TripVega';
const GYG_PASSWORD = '7a381076927e62da453ee16d24c052df';

async function testGyg() {
    console.log("Testing GYG API Search...");
    const auth = Buffer.from(`${GYG_USERNAME}:${GYG_PASSWORD}`).toString('base64');
    const url = 'https://api.getyourguide.com/1/activities?q=London&limit=5';

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json'
            }
        });
        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log("Data:", JSON.stringify(data, null, 2).substring(0, 1000));
    } catch (err) {
        console.error("Error:", err);
    }
}

testGyg();
