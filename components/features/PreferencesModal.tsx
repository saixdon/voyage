"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useCurrency } from "@/lib/currency/context";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "language" | "currency";
}

const languages = [
    { code: "en", name: "English", flag: "🇬🇧", region: "United States / United Kingdom" },
    { code: "de", name: "Deutsch", flag: "🇩🇪", region: "Deutschland / Österreich / Schweiz" },
    { code: "fr", name: "Français", flag: "🇫🇷", region: "France / Belgique / Suisse" },
    { code: "es", name: "Español", flag: "🇪🇸", region: "España / Latinoamérica" },
    { code: "it", name: "Italiano", flag: "🇮🇹", region: "Italia / Svizzera" },
    { code: "pt", name: "Português", flag: "🇵🇹", region: "Portugal / Brasil" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱", region: "Nederland / België" },
    { code: "ja", name: "日本語", flag: "🇯🇵", region: "Japan" },
    { code: "zh", name: "中文", flag: "🇨🇳", region: "China / Taiwan / Singapore" },
];

export function PreferencesModal({ isOpen, onClose, initialTab = "language" }: PreferencesModalProps) {
    const t = useTranslations('nav');
    const [activeTab, setActiveTab] = useState<"language" | "currency">(initialTab);
    const [currencySearch, setCurrencySearch] = useState("");

    // I18n hooks
    const currentLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Currency hooks - now uses dynamic availableCurrencies
    const { currency: currentCurrency, setCurrency, availableCurrencies, isLoading } = useCurrency();

    // Filter currencies based on search
    const filteredCurrencies = useMemo(() => {
        if (!currencySearch.trim()) return availableCurrencies;
        const search = currencySearch.toLowerCase();
        return availableCurrencies.filter(c =>
            c.code.toLowerCase().includes(search) ||
            c.name.toLowerCase().includes(search)
        );
    }, [availableCurrencies, currencySearch]);

    // Handlers
    const handleLanguageChange = (code: string) => {
        const params = searchParams.toString();
        const newPath = params ? `${pathname}?${params}` : pathname;
        router.replace(newPath, { locale: code });
        onClose();
    };

    const handleCurrencyChange = (currencyCode: string) => {
        const selected = availableCurrencies.find(c => c.code === currencyCode);
        if (selected) {
            setCurrency(selected);
            onClose();
        }
    };

    // Derived logic for tab switching
    const tabs = [
        { id: "language", label: t('language') || "Language" },
        { id: "currency", label: t('currency') || "Currency" },
    ] as const;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header with Tabs */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="text-xl font-bold text-foreground px-2">
                                {t('settings') || "Preferences"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Tabs Container */}
                        <div className="px-6 pt-6 pb-2">
                            <div className="flex space-x-8 border-b border-white/10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as "language" | "currency")}
                                        className={`pb-3 text-sm font-medium transition-all relative ${activeTab === tab.id
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 overflow-y-auto min-h-[300px]">
                            {activeTab === "language" && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Select your preferred language for the interface.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => handleLanguageChange(lang.code)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${currentLocale === lang.code
                                                    ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                                                    : "bg-surface-elevated border-white/5 hover:border-white/10 hover:bg-surface-elevated/80"
                                                    }`}
                                            >
                                                <span className="text-3xl shadow-sm">{lang.flag}</span>
                                                <div className="flex-1">
                                                    <div className={`font-semibold ${currentLocale === lang.code ? "text-primary" : "text-foreground"}`}>
                                                        {lang.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {lang.region}
                                                    </div>
                                                </div>
                                                {currentLocale === lang.code && (
                                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "currency" && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Select your preferred currency for prices.
                                    </p>

                                    {/* Search Input */}
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
                                        <input
                                            type="text"
                                            value={currencySearch}
                                            onChange={(e) => setCurrencySearch(e.target.value)}
                                            placeholder="Search currencies..."
                                            className="w-full h-10 pl-10 pr-4 bg-surface-elevated border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
                                        />
                                    </div>

                                    {/* Currency Grid */}
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                            {filteredCurrencies.map((curr) => (
                                                <button
                                                    key={curr.code}
                                                    onClick={() => handleCurrencyChange(curr.code)}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${currentCurrency.code === curr.code
                                                        ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                                                        : "bg-surface-elevated border-white/5 hover:border-white/10 hover:bg-surface-elevated/80"
                                                        }`}
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-xl font-bold text-foreground border border-white/10 group-hover:border-primary/30 transition-colors">
                                                        {curr.symbol}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`font-semibold ${currentCurrency.code === curr.code ? "text-primary" : "text-foreground"}`}>
                                                            {curr.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {curr.code}
                                                        </div>
                                                    </div>
                                                    {currentCurrency.code === curr.code && (
                                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                                    )}
                                                </button>
                                            ))}
                                            {filteredCurrencies.length === 0 && (
                                                <p className="col-span-2 text-center text-muted-foreground py-8">
                                                    No currencies found for "{currencySearch}"
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
