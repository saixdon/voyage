
import 'dotenv/config';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

console.log("API Base:", VIATOR_API_BASE);
console.log("API Key:", VIATOR_API_KEY ? "SET" : "NOT SET");

async function testProductDetails(productCode: string) {
    console.log(`\n=== Testing Product Details for: ${productCode} ===`);

    try {
        const response = await fetch(`${VIATOR_API_BASE}/products/${productCode}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'exp-api-key': VIATOR_API_KEY!,
            },
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const text = await response.text();
            console.log("Error Body:", text);
            return;
        }

        const data = await response.json();
        console.log("Product Code:", data.productCode);
        console.log("Title:", data.title);
        console.log("Destinations:", data.destinations?.map((d: any) => d.name).join(", "));
        console.log("Price From:", data.pricing?.summary?.fromPrice, data.pricing?.currency);
        console.log("Rating:", data.reviews?.combinedAverageRating, `(${data.reviews?.totalReviews} reviews)`);
        console.log("Images:", data.images?.length || 0, "images");

    } catch (e) {
        console.error("Error:", e);
    }
}

async function testReviews(productCode: string) {
    console.log(`\n=== Testing Reviews for: ${productCode} ===`);

    try {
        const response = await fetch(`${VIATOR_API_BASE}/reviews/product`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'Content-Type': 'application/json',
                'exp-api-key': VIATOR_API_KEY!,
            },
            body: JSON.stringify({
                productCode: productCode,
                provider: "ALL",
                count: 5,
                start: 1,
                ratings: [1, 2, 3, 4, 5]
            }),
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const text = await response.text();
            console.log("Error Body:", text);
            return;
        }

        const data = await response.json();
        console.log("Total Reviews:", data.totalReviews);
        console.log("Reviews returned:", data.reviews?.length || 0);
        if (data.reviews && data.reviews[0]) {
            console.log("Sample Review:", data.reviews[0].text?.substring(0, 100) + "...");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

async function run() {
    // Test with a known Paris product from our earlier search
    await testProductDetails("440870P1");
    await testReviews("440870P1");

    // Also test the one from the user's URL
    await testProductDetails("5310P21");
}

run();
