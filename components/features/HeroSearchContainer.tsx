"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AIPlannerAdvancedParams, type AIPreferences } from "./AIPlannerAdvancedParams";
import { SlidersHorizontal, Search, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

import { SearchBar } from "./SearchBar";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import "react-day-picker/dist/style.css";
import { de, enUS, it, ja, zhCN, pt, nl, fr, es } from "date-fns/locale";
import { useLocale } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
} from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface HeroSearchContainerProps {
    className?: string;
}

export function HeroSearchContainer({ className }: HeroSearchContainerProps) {
    const router = useRouter();
    const [mode, setMode] = useState<'search' | 'ai'>('search');
    const [aiQuery, setAiQuery] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [prefs, setPrefs] = useState<AIPreferences>({
        travelers: 'couple',
        vibe: [],
        budget: 'balanced',
        pacing: 'balanced',
        mobility: 'active'
    });
    const [date, setDate] = useState<DateRange | undefined>();
    const [guestCount, setGuestCount] = useState(2);
    const locale = useLocale();

    const dateLocales: Record<string, any> = {
        de,
        en: enUS,
        it,
        ja,
        zh: zhCN,
        pt,
        nl,
        fr,
        es
    };

    // Update guest count when traveler type changes
    React.useEffect(() => {
        switch (prefs.travelers) {
            case 'solo': setGuestCount(1); break;
            case 'couple': setGuestCount(2); break;
            case 'family_kids': setGuestCount(4); break;
            case 'family_teens': setGuestCount(4); break;
            case 'friends': setGuestCount(4); break;
        }
    }, [prefs.travelers]);

    const t = useTranslations('hero');
    const tCommon = useTranslations('common');

    const handleAiSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (aiQuery.trim()) {
            const params = new URLSearchParams();
            params.set("q", aiQuery);
            params.set("travelers", prefs.travelers);
            params.set("budget", prefs.budget);
            params.set("pacing", prefs.pacing);
            params.set("mobility", prefs.mobility);
            if (prefs.vibe.length > 0) {
                params.set("vibe", prefs.vibe.join(","));
            }
            if (date?.from) {
                params.set("from", date.from.toISOString());
            }
            params.set("guests", guestCount.toString());

            router.push(`/ai-plan?${params.toString()}`);
        }
    };

    // Use raw to get the array if supported, otherwise default to English suggestions or mapped ones
    // For now, let's use a safe way to get translated suggestions
    const suggestions = [0, 1, 2, 3].map(idx => t(`suggestions.${idx}`));

    return (
        <div className="w-full flex flex-col items-center relative z-50">
            {/* Toggle Switch */}
            <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-lg mb-6 border border-white/10 opacity-0 animate-fade-in-up-delay-1">
                <button
                    onClick={() => setMode('search')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                        mode === 'search'
                            ? "bg-white text-black shadow-lg"
                            : "text-gray-300 hover:text-white"
                    )}
                >
                    {t('classicSearch')}
                </button>
                <button
                    onClick={() => setMode('ai')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                        mode === 'ai'
                            ? "bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/20"
                            : "text-gray-300 hover:text-white"
                    )}
                >
                    <Sparkles className="w-4 h-4" />
                    {t('aiPlanner')}
                </button>
            </div>

            {/* Content Area */}
            <div className="w-full flex justify-center opacity-0 animate-fade-in-up-delay-2 min-h-[80px]">
                {mode === 'search' ? (
                    <SearchBar placeholder={t('searchPlaceholder')} />
                ) : (
                    <div className="w-full max-w-3xl relative">
                        <form
                            onSubmit={handleAiSubmit}
                            className="flex flex-col md:flex-row items-center p-2 bg-surface/95 backdrop-blur-xl rounded-xl shadow-2xl w-full border border-primary/30 ring-1 ring-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(43,140,238,0.15)] relative z-50"
                        >
                            {/* Animated gradient border effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-cyan-500/10 pointer-events-none rounded-xl" />

                            <div className="relative flex items-center flex-1 w-full md:w-auto px-6 py-2">
                                <Sparkles className="w-5 h-5 text-primary mr-3 animate-pulse flex-shrink-0" />
                                <input
                                    type="text"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    placeholder={t('aiPlaceholder')}
                                    className="w-full text-base font-medium text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
                                />
                                {/* Advanced Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setAdvancedOpen(!advancedOpen)}
                                    className={cn(
                                        "ml-2 p-2 rounded-full transition-all duration-300",
                                        advancedOpen ? "bg-primary/20 text-primary" : "hover:bg-white/10 text-gray-400 hover:text-white"
                                    )}
                                    title={t('customizeTrip')}
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-1 w-full md:w-auto relative z-50">
                                <button
                                    type="submit"
                                    disabled={isAiLoading || !aiQuery.trim()}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isAiLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                            {t('planning')}
                                        </span>
                                    ) : (
                                        <>
                                            {t('generatePlan')}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Extra Inputs Row (Date & Guests) - Only visible when AI mode is active */}
                        <div className="flex flex-wrap justify-center gap-4 mt-4 animate-fade-in-up">
                            {/* Date Picker Modal */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 hover:border-primary/50 transition-all text-sm",
                                        date ? "text-white" : "text-white/60"
                                    )}>
                                        <CalendarIcon className="w-4 h-4" />
                                        {date?.from ? (
                                            format(date.from, "d. MMM", { locale: dateLocales[locale] || enUS })
                                        ) : (
                                            t('searchPlaceholder') === "Search destinations..." ? "Any dates" : tCommon('pickDate')
                                        )}
                                    </button>
                                </DialogTrigger>
                                <DialogPortal>
                                    <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
                                    <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-theme rounded-[2rem] shadow-2xl z-[101] p-0 overflow-hidden focus:outline-none animate-scale-in">
                                        <div className="p-8">
                                            <div className="flex items-center justify-center mb-8 relative">
                                                <h3 className="text-xl font-bold text-foreground">
                                                    {tCommon('selectDate')}
                                                </h3>
                                                <DialogTrigger asChild>
                                                    <button className="absolute -right-2 top-0 p-1 text-muted-foreground hover:text-foreground transition-colors">
                                                        <X className="w-6 h-6" />
                                                    </button>
                                                </DialogTrigger>
                                            </div>
                                            <div className="flex justify-center">
                                                <Calendar
                                                    mode="range"
                                                    defaultMonth={date?.from || startOfToday()}
                                                    selected={date}
                                                    onSelect={setDate}
                                                    numberOfMonths={1}
                                                    locale={dateLocales[locale] || enUS}
                                                    disabled={{ before: startOfToday() }}
                                                    className="mx-auto"
                                                />
                                            </div>
                                        </div>
                                    </DialogContent>
                                </DialogPortal>
                            </Dialog>

                            {/* Guest Count - Only visible for Family/Friends */}
                            {['family_kids', 'family_teens', 'friends'].includes(prefs.travelers) && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 hover:border-primary/50 transition-all animate-fade-in-up">
                                    <Users className="w-4 h-4 text-white/60" />
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                                        className="w-12 bg-transparent text-white text-sm text-center focus:outline-none"
                                    />
                                    <span className="text-white/60 text-sm">Pers.</span>
                                </div>
                            )}
                        </div>

                        {/* Advanced Params Panel - Positioned below form */}
                        <div className={cn(
                            "absolute top-full left-0 right-0 mt-2 z-10 w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300",
                            advancedOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                        )}>
                            <AIPlannerAdvancedParams
                                isOpen={advancedOpen}
                                onClose={() => setAdvancedOpen(false)}
                                onChange={setPrefs}
                            />
                        </div>

                        {/* Suggestions Chips - Only show when panel is closed */}
                        {!advancedOpen && (
                            <div className="mt-4 flex flex-col items-center gap-4 animate-fade-in-up">
                                <div className="flex flex-wrap justify-center gap-3">
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setAiQuery(suggestion)}
                                            className="px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-primary/50 text-xs text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                                {/* Hint Text */}
                                <p className="text-xs text-white/50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    {t('hint')}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
