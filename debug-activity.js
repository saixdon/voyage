
require('dotenv').config();

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const PRODUCT_CODE = "137859P6";

async function testFetch() {
    console.log(`Fetching ${PRODUCT_CODE} from ${VIATOR_API_BASE}/products/bulk...`);

    // Simulate exactly what getViatorProductDetails does
    const response = await fetch(`${VIATOR_API_BASE}/products/bulk`, {
        method: "POST",
        headers: {
            "Accept": "application/json;version=2.0",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            "exp-api-key": VIATOR_API_KEY,
        },
        body: JSON.stringify({
            productCodes: [PRODUCT_CODE],
            currency: "EUR"
        })
    });

    console.log("Status:", response.status);

    if (!response.ok) {
        console.error("Error Body:", await response.text());
        return;
    }

    const data = await response.json();
    console.log("Data keys:", Object.keys(data));

    if (data.products && data.products.length > 0) {
        console.log("Product successfully found!");
        console.log("Pricing found?", !!data.products[0].pricing);
    } else {
        console.error("PROBLEM: products array is empty or missing!");
        console.log("Full Response:", JSON.stringify(data, null, 2));
    }
}

testFetch();
