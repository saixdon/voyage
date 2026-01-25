
require('dotenv').config();

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

async function testSearch() {
    console.log(`Searching for 137859P6...`);

    // Search by product code filtering
    const response = await fetch(`${VIATOR_API_BASE}/products/search`, {
        method: "POST",
        headers: {
            "Accept": "application/json;version=2.0",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            "exp-api-key": VIATOR_API_KEY,
        },
        body: JSON.stringify({
            searchTerm: "Private Tour to Stonehenge, Bath and The Cotswolds", // Search by title to find it
            pagination: { start: 1, count: 1 },
            filtering: { destination: "737" }, // London
            currency: "EUR"
        })
    });

    const data = await response.json();
    if (data.products && data.products.length > 0) {
        console.log("Product found:", data.products[0].productCode);
        console.log("Search Result Pricing:", JSON.stringify(data.products[0].pricing, null, 2));
    } else {
        console.log("Not found in search");
    }
}
testSearch();
