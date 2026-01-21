"use client";

import React, { useState, useEffect, useTransition } from "react";
// import Link from "next/link"; // Replaced by localized Link
import { useTheme } from "next-themes";
import { AuthModal } from "./AuthModal";
import { supabase } from "@/lib/supabase/client";
import { useCurrency } from "@/lib/currency/context";
import { currencies } from "@/lib/currency/types";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
];

import { useAuth } from "@/lib/auth/auth-context";

export function Navbar() {
    const t = useTranslations('nav');
    const authT = useTranslations('auth');
    const currentLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { user, signOut: handleLogout } = useAuth(); // Modified this line
    const { currency, setCurrency } = useCurrency();

    // selectedLanguage is now derived from currentLocale
    const selectedLanguage = languages.find(l => l.code === currentLocale) || languages[0];

    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const searchParams = useSearchParams(); // Add this hook

    const handleLanguageChange = (code: string) => {
        startTransition(() => {
            // Construct the new path with existing search params
            const params = searchParams.toString();
            const newPath = params ? `${pathname}?${params}` : pathname;
            router.replace(newPath, { locale: code });
        });
        setShowLanguageDropdown(false);
    };

    useEffect(() => {
        setMounted(true);
    }, []); // Modified this useEffect

    const handleUserLogout = async () => { // Renamed to avoid conflict with destructured handleLogout
        await handleLogout(); // Call the signOut function from useAuth
        setShowUserMenu(false);
    };

    const currentTheme = resolvedTheme || theme;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass-strong transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                        <div className="h-12 w-auto relative transition-transform duration-300 group-hover:scale-105">
                            <img
                                src="/brand/logo_transparent.png"
                                alt="TripVega"
                                className="h-full w-auto object-contain dark:brightness-100 brightness-0 transition-all duration-300"
                            />
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                            href="/destinations"
                        >
                            {t('destinations')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                            href="/search"
                        >
                            {t('activities')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                            href="/search"
                        >
                            {t('culture')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Currency Selector */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowCurrencyDropdown(!showCurrencyDropdown);
                                    setShowLanguageDropdown(false);
                                    setShowUserMenu(false);
                                }}
                                className="h-10 px-3 flex items-center gap-1 text-foreground/80 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-all text-sm font-medium"
                            >
                                <span>{currency.symbol}</span>
                                <span className="hidden sm:inline">{currency.code}</span>
                                <span className="material-symbols-outlined text-sm">
                                    expand_more
                                </span>
                            </button>

                            {showCurrencyDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-surface border border-theme rounded-xl shadow-xl overflow-hidden z-50">
                                    {currencies.map((curr) => (
                                        <button
                                            key={curr.code}
                                            onClick={() => {
                                                setCurrency(curr);
                                                setShowCurrencyDropdown(false);
                                            }}
                                            className={`w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-surface-elevated transition-colors ${currency.code === curr.code
                                                ? "text-primary bg-primary/5"
                                                : "text-foreground"
                                                }`}
                                        >
                                            <span className="font-medium">{curr.symbol}</span>
                                            <span>{curr.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowLanguageDropdown(!showLanguageDropdown);
                                    setShowCurrencyDropdown(false);
                                    setShowUserMenu(false);
                                }}
                                className="h-10 px-3 flex items-center gap-1 text-foreground/80 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-all text-sm font-medium"
                            >
                                <span className="text-lg">{selectedLanguage.flag}</span>
                                <span className="hidden sm:inline">{selectedLanguage.code.toUpperCase()}</span>
                                <span className="material-symbols-outlined text-sm">
                                    expand_more
                                </span>
                            </button>

                            {showLanguageDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-44 bg-surface border border-theme rounded-xl shadow-xl overflow-hidden z-50">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            disabled={isPending}
                                            className={`w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-surface-elevated transition-colors ${selectedLanguage.code === lang.code
                                                ? "text-primary bg-primary/5"
                                                : "text-foreground"
                                                }`}
                                        >
                                            <span className="text-lg">{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                                className="h-10 w-10 flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-all"
                                aria-label="Toggle theme"
                            >
                                <span className="material-symbols-outlined">
                                    {currentTheme === "dark" ? "light_mode" : "dark_mode"}
                                </span>
                            </button>
                        )}

                        {/* Auth Button / User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowUserMenu(!showUserMenu);
                                        setShowCurrencyDropdown(false);
                                        setShowLanguageDropdown(false);
                                    }}
                                    className="h-10 w-10 flex items-center justify-center bg-primary/20 text-primary hover:bg-primary/30 rounded-full transition-all"
                                >
                                    <span className="material-symbols-outlined">person</span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-theme rounded-xl shadow-xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-theme">
                                            <p className="text-sm text-foreground font-medium truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <Link
                                            href="/dashboard/bookings"
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-foreground hover:bg-surface-elevated transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                confirmation_number
                                            </span>
                                            {t('bookings')}
                                        </Link>
                                        <Link
                                            href="/dashboard/trips"
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-foreground hover:bg-surface-elevated transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                travel_explore
                                            </span>
                                            Meine Planung
                                        </Link>
                                        <Link
                                            href="/dashboard/favorites"
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-foreground hover:bg-surface-elevated transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                favorite
                                            </span>
                                            {t('favorites')}
                                        </Link>
                                        <Link
                                            href="/dashboard/settings"
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-foreground hover:bg-surface-elevated transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                settings
                                            </span>
                                            {t('settings')}
                                        </Link>
                                        <button
                                            onClick={handleUserLogout}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-surface-elevated transition-colors border-t border-theme"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                logout
                                            </span>
                                            {t('logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="h-10 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(43,140,238,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">person</span>
                                <span className="hidden sm:inline">{authT('signIn')}</span>
                            </button>
                        )}

                        {/* Search Button */}
                        <Link
                            href="/search"
                            className="hidden md:flex h-10 px-6 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-all duration-300 items-center justify-center gap-2 border border-white/10"
                        >
                            <span className="material-symbols-outlined text-lg">search</span>
                            {t('explore')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
