
import 'dotenv/config';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

if (!VIATOR_API_KEY) {
    console.error("Error: VIATOR_API_KEY is not set.");
    process.exit(1);
}

async function searchActiveProduct() {
    console.log("Searching for an ACTIVE product...");

    const response = await fetch(`${VIATOR_API_BASE}/products/search`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en',
            'Content-Type': 'application/json',
            'exp-api-key': VIATOR_API_KEY!,
        },
        body: JSON.stringify({
            "filtering": {
                "destination": "77" // USA (or any popular destination ID)
            },
            "sorting": {
                "sort": "PRICE",
                "order": "DESCENDING"
            },
            "pagination": {
                "start": 1,
                "count": 10
            },
            "currency": "EUR"
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Search failed: ${response.status} - ${errorText}`);
        return;
    }

    const data = await response.json();
    console.log(`Found ${data.products?.length || 0} products via search.`);

    if (data.products && data.products.length > 0) {
        console.log("Active Product Codes:");
        data.products.forEach((p: any) => {
            console.log(`- ${p.productCode}: ${p.title} (${p.status})`);
        });

        // Pick the first one
        const productCode = data.products[0].productCode;
        console.log(`\nUse this product code for testing: ${productCode}`);
    } else {
        console.log("No products found.");
    }
}

searchActiveProduct().catch(console.error);
