import { NextResponse } from 'next/server';
import { fetchViatorExchangeRates } from '@/lib/api/viator-client';

// Fallback to Frankfurter API if Viator fails
async function fetchFrankfurterRates(): Promise<Record<string, number> | null> {
    try {
        const response = await fetch(
            'https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,CHF,AUD,CAD,JPY,CNY,INR,BRL,MXN,SGD,HKD,NOK,SEK,DKK,PLN,CZK,HUF,RON,TRY,ZAR,NZD,THB,KRW,TWD,PHP,MYR,IDR,AED,SAR',
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return {
            EUR: 1,
            ...data.rates,
        };
    } catch (error) {
        console.error('Frankfurter API fallback failed:', error);
        return null;
    }
}

// Static fallback rates if all APIs fail
const FALLBACK_RATES: Record<string, number> = {
    EUR: 1,
    USD: 1.08,
    GBP: 0.86,
    CHF: 0.94,
    AUD: 1.65,
    CAD: 1.47,
    JPY: 162.5,
};

export async function GET() {
    try {
        // 1. Try Viator API first (primary source)
        const viatorResponse = await fetchViatorExchangeRates('EUR');

        if (!viatorResponse.error) {
            const ratesArray = viatorResponse.rates || viatorResponse.exchangeRates || [];

            if (ratesArray.length > 0) {
                // Transform array to object { currencyCode: rate }
                const rates: Record<string, number> = { EUR: 1 };

                for (const r of ratesArray) {
                    const code = r.targetCurrency;
                    if (code && r.rate) {
                        rates[code] = r.rate;
                    }
                }

                console.log(`[Currency API] Loaded ${Object.keys(rates).length} rates from Viator`);

                return NextResponse.json({
                    base: 'EUR',
                    rates,
                    updated: new Date().toISOString(),
                    source: 'Viator Partner API',
                });
            }
        }

        console.warn('[Currency API] Viator failed, trying Frankfurter fallback...');

        // 2. Fallback to Frankfurter API
        const frankfurterRates = await fetchFrankfurterRates();

        if (frankfurterRates) {
            console.log(`[Currency API] Loaded ${Object.keys(frankfurterRates).length} rates from Frankfurter`);

            return NextResponse.json({
                base: 'EUR',
                rates: frankfurterRates,
                updated: new Date().toISOString(),
                source: 'ECB via Frankfurter API',
            });
        }

        console.warn('[Currency API] All APIs failed, using static fallback');

        // 3. Static fallback
        return NextResponse.json({
            base: 'EUR',
            rates: FALLBACK_RATES,
            updated: null,
            fallback: true,
            source: 'Static Fallback',
        });

    } catch (error) {
        console.error('Exchange rate API error:', error);

        return NextResponse.json({
            base: 'EUR',
            rates: FALLBACK_RATES,
            updated: null,
            fallback: true,
            source: 'Static Fallback (Error)',
        });
    }
}
