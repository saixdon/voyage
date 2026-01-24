"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Currency, CurrencyCode, CurrencyContextType, PRIMARY_CURRENCIES, getCurrencyMetadata } from './types';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'tripvega-currency';
const RATES_CACHE_KEY = 'tripvega-rates';
const RATES_CACHE_DURATION = 3600000; // 1 hour

// Default fallback rates (EUR base)
const DEFAULT_RATES: Record<CurrencyCode, number> = {
    EUR: 1,
    USD: 1.08,
    GBP: 0.86,
    CHF: 0.94,
};

interface CurrencyProviderProps {
    children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
    const [currency, setCurrencyState] = useState<Currency>(PRIMARY_CURRENCIES[0]);
    const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);
    const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>(PRIMARY_CURRENCIES);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved currency preference on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            // Try to find in primary currencies first
            const found = PRIMARY_CURRENCIES.find(c => c.code === saved);
            if (found) {
                setCurrencyState(found);
            } else {
                // Generate metadata for saved currency
                const generated = getCurrencyMetadata(saved);
                setCurrencyState(generated);
            }
        }
        fetchRates();
    }, []);

    // Fetch latest exchange rates
    const fetchRates = async () => {
        try {
            // Check cache first
            const cached = localStorage.getItem(RATES_CACHE_KEY);
            if (cached) {
                const { rates: cachedRates, currencies: cachedCurrencies, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < RATES_CACHE_DURATION) {
                    setRates(cachedRates);
                    if (cachedCurrencies && cachedCurrencies.length > 0) {
                        setAvailableCurrencies(cachedCurrencies);
                    }
                    setIsLoading(false);
                    return;
                }
            }

            // Fetch fresh rates from API
            const response = await fetch('/api/currency/rates');
            if (response.ok) {
                const data = await response.json();
                setRates(data.rates);

                // Build available currencies from the rates
                const currencyList: Currency[] = [];

                // Add primary currencies first (if they have rates)
                for (const primary of PRIMARY_CURRENCIES) {
                    if (data.rates[primary.code] !== undefined) {
                        currencyList.push(primary);
                    }
                }

                // Add other currencies from rates
                const primaryCodes = new Set(PRIMARY_CURRENCIES.map(c => c.code));
                for (const code of Object.keys(data.rates)) {
                    if (!primaryCodes.has(code)) {
                        currencyList.push(getCurrencyMetadata(code));
                    }
                }

                setAvailableCurrencies(currencyList);

                // Cache the rates and currencies
                localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({
                    rates: data.rates,
                    currencies: currencyList,
                    timestamp: Date.now(),
                }));
            }
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            // Keep using fallback rates
        } finally {
            setIsLoading(false);
        }
    };

    // Set currency and persist to localStorage
    const setCurrency = useCallback((newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        localStorage.setItem(STORAGE_KEY, newCurrency.code);
    }, []);

    // Convert amount from base currency (EUR) to selected currency
    const convert = useCallback((amount: number, from: CurrencyCode = 'EUR'): number => {
        const fromRate = rates[from] || 1;
        const toRate = rates[currency.code] || 1;
        return (amount / fromRate) * toRate;
    }, [rates, currency]);

    // Format amount in selected currency with proper locale
    const format = useCallback((amount: number, from: CurrencyCode = 'EUR'): string => {
        const converted = convert(amount, from);
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(converted);
    }, [convert, currency]);

    const value: CurrencyContextType = {
        currency,
        setCurrency,
        convert,
        format,
        rates,
        availableCurrencies,
        isLoading,
    };

    return (
        <CurrencyContext.Provider value={value}>
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
