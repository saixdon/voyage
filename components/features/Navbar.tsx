"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useTheme } from "next-themes";
import { useCurrency } from "@/lib/currency/context";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PreferencesModal } from "./PreferencesModal";
import { MobileMenu } from "./MobileMenu";
import { Menu } from "lucide-react";

const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
];

export function Navbar() {
    const t = useTranslations('nav');
    const authT = useTranslations('auth');
    const currentLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { user, signOut: handleLogout } = useAuth();
    const { currency } = useCurrency();

    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleUserLogout = async () => {
        await handleLogout();
        setShowUserMenu(false);
    };

    const currentTheme = resolvedTheme || theme;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass-strong transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
                    {/* Logo - Left */}
                    <Link href="/" className="flex items-center gap-3 cursor-pointer group flex-shrink-0">
                        <div className="h-12 w-auto relative transition-transform duration-300 group-hover:scale-105">
                            <img
                                src="/brand/logo_transparent.png"
                                alt="TripVega"
                                className="h-full w-auto object-contain dark:brightness-100 brightness-0 transition-all duration-300"
                            />
                        </div>
                    </Link>

                    {/* Center Navigation - Takes up remaining space and centers content */}
                    <div className="flex-1 flex justify-center">
                        <div className="hidden md:flex items-center gap-10">
                            <Link
                                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                                href="/search?q=activities"
                            >
                                {t('activities')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                            <Link
                                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                                href="/search?q=transport"
                            >
                                {t('transport')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                            <Link
                                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                                href="/search?q=culture"
                            >
                                {t('culture')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Combined Language & Currency Selector - Opens Modal */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsPreferencesOpen(true);
                                    setShowUserMenu(false);
                                }}
                                className="h-10 w-10 flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-all group"
                                aria-label="Language and Currency"
                            >
                                <span className="material-symbols-outlined transition-transform group-hover:rotate-45">language</span>
                            </button>
                        </div>

                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                                className="hidden md:flex h-10 w-10 items-center justify-center text-foreground/80 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-all"
                                aria-label="Toggle theme"
                            >
                                <span className="material-symbols-outlined">
                                    {currentTheme === "dark" ? "light_mode" : "dark_mode"}
                                </span>
                            </button>
                        )}

                        {/* Auth Button / User Menu (Desktop) */}
                        <div className="hidden md:block">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(!showUserMenu);
                                            setIsPreferencesOpen(false);
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
                                                {t('trips')}
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
                                <Link
                                    href="/login"
                                    className="h-10 w-10 flex items-center justify-center bg-primary/20 text-primary hover:bg-primary/30 rounded-full transition-all"
                                    aria-label={authT('signIn')}
                                >
                                    <span className="material-symbols-outlined">person</span>
                                </Link>
                            )}
                        </div>

                        {/* Hamburger Menu (Mobile Only) */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="h-10 w-10 flex items-center justify-center text-foreground hover:bg-surface-elevated rounded-lg transition-colors min-w-[44px] min-h-[44px]"
                                aria-label="Open menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <PreferencesModal
                isOpen={isPreferencesOpen}
                onClose={() => setIsPreferencesOpen(false)}
            />
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
        </>
    );
}
