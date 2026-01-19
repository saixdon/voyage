"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Currency, CurrencyCode, CurrencyContextType, currencies } from './types';

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
    const [currency, setCurrencyState] = useState<Currency>(currencies[0]);
    const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved currency preference on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const found = currencies.find(c => c.code === saved);
            if (found) {
                setCurrencyState(found);
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
                const { rates: cachedRates, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < RATES_CACHE_DURATION) {
                    setRates(cachedRates);
                    setIsLoading(false);
                    return;
                }
            }

            // Fetch fresh rates from API
            const response = await fetch('/api/currency/rates');
            if (response.ok) {
                const data = await response.json();
                setRates(data.rates);

                // Cache the rates
                localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({
                    rates: data.rates,
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
        const fromRate = rates[from];
        const toRate = rates[currency.code];
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
