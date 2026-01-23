
import 'dotenv/config';

const VIATOR_API_BASE = process.env.VIATOR_API_BASE_URL || "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

if (!VIATOR_API_KEY) {
    console.error("Error: VIATOR_API_KEY is not set.");
    process.exit(1);
}

// Test product code - replace with a real product code from your catalog
const TEST_PRODUCT_CODE = "5602P47";  // Mighty Five Aerial Adventure
const TEST_DATE = "2026-02-15"; // Future date

async function testAvailabilityCheck() {
    console.log("Testing /availability/check endpoint...");
    console.log(`Product: ${TEST_PRODUCT_CODE}, Date: ${TEST_DATE}`);

    const response = await fetch(`${VIATOR_API_BASE}/availability/check`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en',
            'Content-Type': 'application/json',
            'exp-api-key': VIATOR_API_KEY!,
        },
        body: JSON.stringify({
            productCode: TEST_PRODUCT_CODE,
            travelDate: TEST_DATE,
            paxMix: [
                { ageBand: "ADULT", numberOfTravelers: 2 }
            ],
            currency: "EUR"
        })
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response:", errorText);
        return;
    }

    const data = await response.json();
    console.log("Availability Response:");
    console.log(JSON.stringify(data, null, 2));

    // Summary
    if (data.bookableItems && data.bookableItems.length > 0) {
        console.log("\n✅ Availability check successful!");
        console.log(`Found ${data.bookableItems.length} bookable options`);

        const firstItem = data.bookableItems[0];
        if (firstItem.price) {
            console.log(`Price: ${firstItem.price.totalPrice?.price?.value} ${firstItem.price.totalPrice?.price?.currency}`);
        }
    } else {
        console.log("\n⚠️ No bookable items found for this date/product");
    }
}

testAvailabilityCheck().catch(console.error);
