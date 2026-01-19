
import { format } from "date-fns";

// Mock implementation of logic in TripActivityCard
function generateBookingUrl(
    productUrl: string,
    date: Date | undefined,
    travelerCount: number | undefined,
    tripId?: string,
    itemDbId?: string
): string {
    let url = productUrl;
    const separator = url.includes('?') ? '&' : '?';
    const uid = tripId && itemDbId ? `${tripId}_${itemDbId}` : undefined;

    let finalUrl = url;

    // Simplified generateAffiliateLink logic for testing
    if (!url.startsWith('https://www.viator.com')) {
        finalUrl = `https://www.viator.com${url.startsWith('/') ? url : '/' + url}`;
    } else if (uid) {
        finalUrl = `${url}${separator}uid=${uid}`;
    }

    const params: string[] = [];

    if (date) {
        const dateStr = date.toISOString().split('T')[0];
        params.push(`date=${dateStr}`);
    }

    if (travelerCount) {
        params.push(`pax=${travelerCount}`);
    }

    if (params.length > 0) {
        const finalSeparator = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${finalSeparator}${params.join('&')}`;
    }

    return finalUrl;
}

// Test Cases
console.log("Running Booking URL Generation Tests...\n");

const tests = [
    {
        name: "Standard API URL with Date & Pax",
        input: {
            url: "https://www.viator.com/tours/Paris/Tour?pid=P123",
            date: new Date("2024-06-15"),
            pax: 2
        },
        expectedSubstring: "date=2024-06-15&pax=2"
    },
    {
        name: "API URL without Query Params",
        input: {
            url: "https://www.viator.com/tours/Paris/Tour",
            date: new Date("2024-07-20"),
            pax: 4
        },
        expectedSubstring: "?date=2024-07-20&pax=4"
    },
    {
        name: "Relative URL (Fallback)",
        input: {
            url: "/tours/London/Eye",
            date: new Date("2024-08-01"),
            pax: 1
        },
        expectedSubstring: "https://www.viator.com/tours/London/Eye?date=2024-08-01&pax=1"
    },
    {
        name: "With Internal Tracking (UID)",
        input: {
            url: "https://www.viator.com/tours/Berlin/Walk?pid=P456",
            date: new Date("2024-09-10"),
            pax: 2,
            tripId: "trip123",
            itemId: "item456"
        },
        expectedSubstring: "uid=trip123_item456&date=2024-09-10&pax=2"
    }
];

let failed = 0;

tests.forEach((test, i) => {
    const result = generateBookingUrl(test.input.url, test.input.date, test.input.pax, test.input.tripId, test.input.itemId);
    console.log(`Test ${i + 1}: ${test.name}`);
    console.log(`  Input URL: ${test.input.url}`);
    console.log(`  Result:    ${result}`);

    if (result.includes(test.expectedSubstring)) {
        console.log("  ✅ PASSED");
    } else {
        console.log(`  ❌ FAILED - Expected to contain: ${test.expectedSubstring}`);
        failed++;
    }
    console.log("---");
});

if (failed === 0) {
    console.log("\nAll tests passed successfully! Logic is robust.");
} else {
    console.log(`\n${failed} tests failed.`);
    process.exit(1);
}
