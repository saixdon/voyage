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
