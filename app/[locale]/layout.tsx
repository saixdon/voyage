import type { Metadata } from "next";
import { Suspense } from "react";
import "../globals.css"; // Pfad anpassen
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CurrencyProvider } from "@/lib/currency/context";
import { Navbar } from "@/components/features/Navbar";
import { Footer } from "@/components/features/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';

export const metadata: Metadata = {
    title: "TripVega - Discover the World",
    description: "Premium tours, activities, and experiences worldwide.",
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

import { AuthProvider } from "@/lib/auth/auth-context";
import { FavoritesProvider } from "@/lib/favorites/favorites-context";
import { TripsProvider } from "@/lib/trips/trips-context";

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Enable static rendering
    setRequestLocale(locale);

    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
            </head>
            <body className="bg-background text-foreground font-display overflow-x-hidden selection:bg-primary selection:text-white" suppressHydrationWarning>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <AuthProvider>
                            <TripsProvider>
                                <FavoritesProvider>
                                    <CurrencyProvider>
                                        <Suspense fallback={<div className="h-20" />}>
                                            <Navbar />
                                        </Suspense>
                                        <main className="min-h-screen pt-20">{children}</main>
                                        <Footer />
                                    </CurrencyProvider>
                                </FavoritesProvider>
                            </TripsProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
