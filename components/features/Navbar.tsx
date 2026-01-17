"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { AuthModal } from "./AuthModal";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const currencies = [
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
];

const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
];

export function Navbar() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
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
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            className="text-sm font-medium text-white/80 hover:text-primary transition-colors relative group"
                            href="/destinations"
                        >
                            Destinations
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            className="text-sm font-medium text-white/80 hover:text-primary transition-colors relative group"
                            href="/search"
                        >
                            Activities
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            className="text-sm font-medium text-white/80 hover:text-primary transition-colors relative group"
                            href="/search"
                        >
                            Culture
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
                                className="h-10 px-3 flex items-center gap-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
                            >
                                <span>{selectedCurrency.symbol}</span>
                                <span className="hidden sm:inline">{selectedCurrency.code}</span>
                                <span className="material-symbols-outlined text-sm">
                                    expand_more
                                </span>
                            </button>

                            {showCurrencyDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-card-dark border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                                    {currencies.map((currency) => (
                                        <button
                                            key={currency.code}
                                            onClick={() => {
                                                setSelectedCurrency(currency);
                                                setShowCurrencyDropdown(false);
                                            }}
                                            className={`w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/10 transition-colors ${selectedCurrency.code === currency.code
                                                ? "text-primary bg-white/5"
                                                : "text-white"
                                                }`}
                                        >
                                            <span className="font-medium">{currency.symbol}</span>
                                            <span>{currency.name}</span>
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
                                className="h-10 px-3 flex items-center gap-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
                            >
                                <span className="text-lg">{selectedLanguage.flag}</span>
                                <span className="hidden sm:inline">{selectedLanguage.code.toUpperCase()}</span>
                                <span className="material-symbols-outlined text-sm">
                                    expand_more
                                </span>
                            </button>

                            {showLanguageDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-44 bg-card-dark border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setSelectedLanguage(lang);
                                                setShowLanguageDropdown(false);
                                            }}
                                            className={`w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/10 transition-colors ${selectedLanguage.code === lang.code
                                                ? "text-primary bg-white/5"
                                                : "text-white"
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
                                className="h-10 w-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
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
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-card-dark border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-sm text-white font-medium truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <Link
                                            href="/dashboard/bookings"
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-white/10 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                confirmation_number
                                            </span>
                                            My Bookings
                                        </Link>
                                        <Link
                                            href="/dashboard/favorites"
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-white/10 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                favorite
                                            </span>
                                            Favorites
                                        </Link>
                                        <Link
                                            href="/dashboard/settings"
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-white/10 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                settings
                                            </span>
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-400 hover:bg-white/10 transition-colors border-t border-white/10"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                logout
                                            </span>
                                            Sign Out
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
                                <span className="hidden sm:inline">Login</span>
                            </button>
                        )}

                        {/* Search Button */}
                        <Link
                            href="/search"
                            className="hidden md:flex h-10 px-6 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-all duration-300 items-center justify-center gap-2 border border-white/10"
                        >
                            <span className="material-symbols-outlined text-lg">search</span>
                            Explore
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
