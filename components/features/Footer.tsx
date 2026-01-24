import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations('footer');
    const navT = useTranslations('nav');
    const homeT = useTranslations('home');

    return (
        <footer className="bg-background-dark border-t border-theme">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <Link href="/" className="md:col-span-1 block group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-auto relative">
                                <img
                                    src="/brand/logo_transparent.png"
                                    alt="TripVega"
                                    className="h-full w-auto object-contain transition-all duration-300 dark:brightness-100 brightness-0"
                                />
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {t('desc')}
                        </p>
                    </Link>

                    {/* Explore */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-4">{t('explore')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                    {t('allActivities')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/destinations" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                                    {navT('destinations')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/search?q=popular" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                    {homeT('trendingTitle')}
                                </Link>
                            </li>

                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-4">{t('company')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                    {t('aboutUs')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/kontakt" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                    {t('contact')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/partner" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                    {t('partner')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-4">{t('legal')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/impressum" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                    {t('imprint')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                    {t('privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/agb" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                    {t('terms')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-theme flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} TripVega. {t('rightsReserved')}
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Affiliate Notice */}
                <div className="mt-8 text-center">
                    <p className="text-muted-foreground text-xs">
                        {t('affiliateDisclaimer')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
