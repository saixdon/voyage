import { NextResponse } from 'next/server';

// Uses frankfurter.app - a free, open-source exchange rate API
// No API key required, based on ECB (European Central Bank) rates

export async function GET() {
    try {
        // Fetch live rates from Frankfurter API (ECB data)
        const response = await fetch(
            'https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,CHF',
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();

        return NextResponse.json({
            base: 'EUR',
            rates: {
                EUR: 1,
                USD: data.rates.USD,
                GBP: data.rates.GBP,
                CHF: data.rates.CHF,
            },
            updated: data.date,
            source: 'ECB via Frankfurter API',
        });
    } catch (error) {
        console.error('Exchange rate API error:', error);

        // Return fallback rates on error
        return NextResponse.json({
            base: 'EUR',
            rates: {
                EUR: 1,
                USD: 1.08,
                GBP: 0.86,
                CHF: 0.94,
            },
            updated: null,
            fallback: true,
        });
    }
}
