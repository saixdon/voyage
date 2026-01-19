
import { searchViatorProducts, getViatorAvailability } from '@/lib/api/viator-client';
import { addDays, format } from 'date-fns';

// Mock env for this script execution
process.env.VIATOR_API_KEY = "fad9e3c8-ecad-446a-81fb-40281a8e3334";
process.env.VIATOR_API_BASE_URL = "https://api.viator.com/partner";

async function testAvailability() {
    console.log("Searching for a product in Paris...");
    const search = await searchViatorProducts("Paris", 1);

    if (!search.activities.length) {
        console.error("No activities found.");
        return;
    }

    const product = search.activities[0];
    console.log(`Found product: ${product.title} (${product.productCode})`);

    const tomorrow = addDays(new Date(), 30); // 30 days out
    const dateStr = format(tomorrow, 'yyyy-MM-dd');
    console.log(`Checking availability for: ${dateStr}`);

    const avail = await getViatorAvailability(product.productCode, dateStr);
    console.log("Availability Result:", JSON.stringify(avail, null, 2));
}

testAvailability();
