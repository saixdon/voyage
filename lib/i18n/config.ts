export const locales = ['en', 'de', 'fr', 'es'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const localePrefix = 'always'; // Default
