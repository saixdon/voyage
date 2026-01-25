const crypto = require('crypto');
require('dotenv').config(); // Load .env file

// API Key from env
const API_KEY = process.env.VIATOR_API_KEY;
if (!API_KEY) {
    console.error('❌ VIATOR_API_KEY not found in .env file!');
    process.exit(1);
}
console.log('Using API Key:', API_KEY.substring(0, 8) + '...');

// Sandbox key starts with 0b0f, production with fad9
const isSandbox = API_KEY.startsWith('0b0f');
const BASE_URL = isSandbox
    ? 'https://api.sandbox.viator.com/partner'
    : 'https://api.viator.com/partner';
console.log('Using URL:', BASE_URL);

async function testCartHold() {
    console.log('Testing Cart Hold API with partnerBookingRef...\n');

    // Build request payload - now with partnerBookingRef per item
    const items = [
        {
            productCode: '181068P1',
            productOptionCode: 'TG1',
            travelDate: '2026-02-20',
            paxMix: [{ ageBand: 'ADULT', numberOfTravelers: 2 }],
            partnerBookingRef: crypto.randomUUID() + '-0', // Required per item!
        }
    ];

    const payload = {
        items,
        currency: 'EUR',
        paymentDataSubmissionMode: 'PARTNER_FORM',
        partnerCartRef: crypto.randomUUID(),
    };

    console.log('Request payload:');
    console.log(JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${BASE_URL}/bookings/cart/hold`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en-US',
                'exp-api-key': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const text = await response.text();
        console.log('\nStatus:', response.status);

        try {
            const json = JSON.parse(text);
            console.log('Response:');
            console.log(JSON.stringify(json, null, 2));

            if (json.cartRef) {
                console.log('\n✅ SUCCESS! Cart hold created.');
                console.log('  Cart Reference:', json.cartRef);
            } else if (json.error || json.code) {
                console.log('\n❌ API Error:', json.message || json.error);
            }
        } catch (e) {
            console.log('Raw response:', text);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testCartHold();
