---
name: currency
description: Manages currency conversion, formatting, and display for TripVega. Use when displaying prices, implementing the currency switcher, converting amounts, or formatting monetary values. Provides React Context pattern and locale-aware formatting.
---

# Currency Management Skill

TripVega displays prices in multiple currencies with real-time conversion. This skill ensures consistent currency handling across all components.

## Supported Currencies

| Code | Symbol | Name | Locale Format |
|------|--------|------|---------------|
| `EUR` | € | Euro | de-DE, fr-FR |
| `USD` | $ | US Dollar | en-US |
| `GBP` | £ | British Pound | en-GB |
| `CHF` | Fr | Swiss Franc | de-CH |

## File Structure

```
voyage/
├── lib/
│   └── currency/
│       ├── context.tsx       # CurrencyProvider & useCurrency hook
│       ├── types.ts          # Currency types
│       ├── formatter.ts      # Price formatting utilities
│       └── rates.ts          # Exchange rate fetching
├── components/
│   └── features/
│       └── CurrencySelector.tsx  # Currency dropdown component
└── app/
    └── api/
        └── currency/
            └── rates/
                └── route.ts  # Exchange rates API endpoint
```

## CurrencyContext Implementation

### Types (lib/currency/types.ts)

```typescript
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number, from?: CurrencyCode) => number;
  format: (amount: number, from?: CurrencyCode) => string;
  rates: Record<CurrencyCode, number>;
  isLoading: boolean;
}

export const currencies: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' },
];
```

### Provider (lib/currency/context.tsx)

```tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Currency, CurrencyCode, CurrencyContextType, currencies } from './types';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'tripvega-currency';
const RATES_CACHE_KEY = 'tripvega-rates';
const RATES_CACHE_DURATION = 3600000; // 1 hour

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(currencies[0]);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>({
    EUR: 1,
    USD: 1.08,
    GBP: 0.86,
    CHF: 0.94,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load saved currency preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = currencies.find(c => c.code === saved);
      if (found) setCurrencyState(found);
    }
    fetchRates();
  }, []);

  // Fetch latest exchange rates
  const fetchRates = async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem(RATES_CACHE_KEY);
      if (cached) {
        const { rates: cachedRates, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < RATES_CACHE_DURATION) {
          setRates(cachedRates);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/currency/rates');
      const data = await response.json();
      setRates(data.rates);
      
      // Cache the rates
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({
        rates: data.rates,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency.code);
  }, []);

  // Convert amount from base currency (EUR) to selected currency
  const convert = useCallback((amount: number, from: CurrencyCode = 'EUR'): number => {
    const fromRate = rates[from];
    const toRate = rates[currency.code];
    return (amount / fromRate) * toRate;
  }, [rates, currency]);

  // Format amount in selected currency
  const format = useCallback((amount: number, from: CurrencyCode = 'EUR'): string => {
    const converted = convert(amount, from);
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }, [convert, currency]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      convert,
      format,
      rates,
      isLoading,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
```

## Usage Patterns

### 1. Displaying Prices

```tsx
import { useCurrency } from '@/lib/currency/context';

function ActivityCard({ activity }) {
  const { format } = useCurrency();
  
  return (
    <div>
      <h3>{activity.title}</h3>
      <p className="price">
        From {format(activity.price)} {/* Will show: "From €29.00" or "From $31.32" */}
      </p>
    </div>
  );
}
```

### 2. Currency Selector Component

```tsx
"use client";

import { useCurrency } from '@/lib/currency/context';
import { currencies } from '@/lib/currency/types';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        {currency.symbol} {currency.code}
      </button>
      
      {isOpen && (
        <div className="dropdown">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c);
                setIsOpen(false);
              }}
              className={currency.code === c.code ? 'active' : ''}
            >
              {c.symbol} {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. API Integration

All prices from Viator API come in EUR. The `format()` function handles conversion automatically:

```tsx
// Price from API is always in EUR
const priceFromAPI = 29.00; 

// format() converts and formats based on selected currency
const displayPrice = format(priceFromAPI); // "€29.00" or "$31.32" etc.
```

## Exchange Rates API

### Endpoint: `/api/currency/rates`

```typescript
// app/api/currency/rates/route.ts
import { NextResponse } from 'next/server';

const EXCHANGE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;

export async function GET() {
  try {
    // Option 1: Use a free API (exchangerate-api.com, frankfurter.app)
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,CHF`
    );
    const data = await response.json();
    
    return NextResponse.json({
      base: 'EUR',
      rates: {
        EUR: 1,
        USD: data.rates.USD,
        GBP: data.rates.GBP,
        CHF: data.rates.CHF,
      },
      updated: new Date().toISOString(),
    });
  } catch (error) {
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
```

## Provider Setup

Add CurrencyProvider to the app layout:

```tsx
// app/layout.tsx
import { CurrencyProvider } from '@/lib/currency/context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
```

## Best Practices

### DO:
- ✅ Always use `format()` to display prices (handles conversion + formatting)
- ✅ Store original price in EUR for data consistency
- ✅ Cache exchange rates (1 hour minimum)
- ✅ Show loading state while rates are fetching
- ✅ Provide fallback rates for offline/error scenarios

### DON'T:
- ❌ Manually format currency with template literals
- ❌ Store converted prices in database
- ❌ Fetch exchange rates on every component render
- ❌ Assume currency symbol position (€ vs $)

## Edge Cases

### 1. Zero or Negative Prices
```tsx
const { format } = useCurrency();
format(0);    // "€0.00"
format(-10);  // "-€10.00" (for refunds)
```

### 2. Very Large Numbers
```tsx
format(1000000); // "€1,000,000.00" (auto-formatting with separators)
```

### 3. Free Activities
```tsx
// Check before formatting
{activity.price > 0 ? format(activity.price) : 'Free'}
```

## Testing Checklist

- [ ] Currency selector saves preference to localStorage
- [ ] Preference persists on page reload
- [ ] All prices update when currency changes
- [ ] Exchange rates are cached properly
- [ ] Fallback rates work when API fails
- [ ] Price formatting follows locale conventions (€ prefix vs $ prefix)
