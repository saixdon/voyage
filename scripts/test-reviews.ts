/**
 * Test script for Viator Reviews API
 * Verifies the correct POST body structure
 */

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const VIATOR_BASE_URL = process.env.VIATOR_API_BASE_URL || 'https://api.sandbox.viator.com/partner';

async function testReviewsAPI() {
    // Known working product code from sandbox
    const productCode = '440870P1';

    console.log('Testing Viator Reviews API...');
    console.log(`Base URL: ${VIATOR_BASE_URL}`);
    console.log(`Product Code: ${productCode}`);
    console.log('---');

    // Test current implementation
    console.log('\n1. Testing current implementation (POST /reviews/product):');
    try {
        const response = await fetch(`${VIATOR_BASE_URL}/reviews/product`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'Content-Type': 'application/json',
                'exp-api-key': VIATOR_API_KEY!,
            },
            body: JSON.stringify({
                productCode: productCode,
                provider: 'ALL',
                count: 5,
                start: 1,
                ratings: [1, 2, 3, 4, 5]
            }),
        });

        console.log(`Status: ${response.status}`);
        const data = await response.text();
        console.log('Response:', data.substring(0, 500));
    } catch (error) {
        console.error('Error:', error);
    }

    // Test alternative structure based on official docs
    console.log('\n2. Testing with productCode as array:');
    try {
        const response = await fetch(`${VIATOR_BASE_URL}/reviews/product`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'Content-Type': 'application/json',
                'exp-api-key': VIATOR_API_KEY!,
            },
            body: JSON.stringify({
                productCodes: [productCode],
                count: 5
            }),
        });

        console.log(`Status: ${response.status}`);
        const data = await response.text();
        console.log('Response:', data.substring(0, 500));
    } catch (error) {
        console.error('Error:', error);
    }

    // Test with minimal body
    console.log('\n3. Testing minimal body:');
    try {
        const response = await fetch(`${VIATOR_BASE_URL}/reviews/product`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en',
                'Content-Type': 'application/json',
                'exp-api-key': VIATOR_API_KEY!,
            },
            body: JSON.stringify({
                productCode: productCode
            }),
        });

        console.log(`Status: ${response.status}`);
        const data = await response.text();
        console.log('Response:', data.substring(0, 500));
    } catch (error) {
        console.error('Error:', error);
    }
}

testReviewsAPI();
