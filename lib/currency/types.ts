// Currency code is now dynamic - any valid ISO 4217 code
export type CurrencyCode = string;

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
    availableCurrencies: Currency[];
    isLoading: boolean;
}

// Primary currencies to show first in the selector
export const PRIMARY_CURRENCIES: Currency[] = [
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' },
];

// Extended list of common currencies with metadata
export const CURRENCY_METADATA: Record<string, { symbol: string; name: string; locale: string }> = {
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    CHF: { symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
    INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    BRL: { symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
    MXN: { symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
    HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'en-HK' },
    NOK: { symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
    SEK: { symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
    DKK: { symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
    PLN: { symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
    CZK: { symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
    HUF: { symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU' },
    RON: { symbol: 'lei', name: 'Romanian Leu', locale: 'ro-RO' },
    TRY: { symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
    ZAR: { symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
    NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
    THB: { symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
    KRW: { symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
    TWD: { symbol: 'NT$', name: 'Taiwan Dollar', locale: 'zh-TW' },
    PHP: { symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
    MYR: { symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
    IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
    SAR: { symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
    ILS: { symbol: '₪', name: 'Israeli Shekel', locale: 'he-IL' },
    RUB: { symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
    BGN: { symbol: 'лв', name: 'Bulgarian Lev', locale: 'bg-BG' },
    HRK: { symbol: 'kn', name: 'Croatian Kuna', locale: 'hr-HR' },
    ISK: { symbol: 'kr', name: 'Icelandic Króna', locale: 'is-IS' },
};

/**
 * Get Currency metadata for a code. 
 * Falls back to generating from Intl if not in our map.
 */
export function getCurrencyMetadata(code: string): Currency {
    const known = CURRENCY_METADATA[code];
    if (known) {
        return { code, ...known };
    }

    // Generate metadata using Intl APIs
    try {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
        const name = displayNames.of(code) || code;

        // Get symbol using a formatter
        const formatter = new Intl.NumberFormat('en', {
            style: 'currency',
            currency: code,
            currencyDisplay: 'narrowSymbol',
        });
        const parts = formatter.formatToParts(0);
        const symbolPart = parts.find(p => p.type === 'currency');
        const symbol = symbolPart?.value || code;

        return {
            code,
            symbol,
            name,
            locale: 'en', // Default locale for unknown currencies
        };
    } catch {
        return {
            code,
            symbol: code,
            name: code,
            locale: 'en',
        };
    }
}

// For backwards compatibility
export const currencies = PRIMARY_CURRENCIES;
