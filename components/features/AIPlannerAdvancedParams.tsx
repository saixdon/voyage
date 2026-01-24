"use client";

import React, { useState, useEffect } from "react";
import { User, Users, Heart, Zap, Coffee, Palmtree, Map as MapIcon, DollarSign, Wallet, Gem, Accessibility, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useTranslations } from "next-intl";

export interface AIPreferences {
    travelers: 'solo' | 'couple' | 'family_kids' | 'family_teens' | 'friends';
    vibe: string[];
    budget: 'saver' | 'balanced' | 'luxury';
    pacing: 'relaxed' | 'balanced' | 'fast';
    mobility: 'active' | 'accessible';
}

interface AIPlannerAdvancedParamsProps {
    onChange: (prefs: AIPreferences) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function AIPlannerAdvancedParams({ onChange, isOpen, onClose }: AIPlannerAdvancedParamsProps) {
    const t = useTranslations('aiAdvanced');
    const [prefs, setPrefs] = useState<AIPreferences>({
        travelers: 'couple',
        vibe: [],
        budget: 'balanced',
        pacing: 'balanced',
        mobility: 'active'
    });

    // Notify parent on change
    useEffect(() => {
        onChange(prefs);
    }, [prefs, onChange]);

    const travelerOptions = [
        { id: 'solo', label: t('options.solo'), icon: User },
        { id: 'couple', label: t('options.couple'), icon: Heart },
        { id: 'family_kids', label: t('options.family_kids'), icon: Users },
        { id: 'family_teens', label: t('options.family_teens'), icon: Users },
        { id: 'friends', label: t('options.friends'), icon: Users },
    ];

    const vibeOptions = [
        { id: 'adventure', label: t('options.adventure'), icon: Zap },
        { id: 'culture', label: t('options.culture'), icon: MapIcon },
        { id: 'romance', label: t('options.romance'), icon: Heart },
        { id: 'food', label: t('options.food'), icon: Coffee },
        { id: 'hidden_gems', label: t('options.hidden_gems'), icon: Palmtree },
    ];

    const budgetOptions = [
        { id: 'saver', label: t('options.saver'), icon: DollarSign, desc: t('options.saverDesc') },
        { id: 'balanced', label: t('options.balanced'), icon: Wallet, desc: t('options.balancedDesc') },
        { id: 'luxury', label: t('options.luxury'), icon: Gem, desc: t('options.luxuryDesc') },
    ];

    const handleVibeToggle = (vibeId: string) => {
        setPrefs(prev => {
            const newVibe = prev.vibe.includes(vibeId)
                ? prev.vibe.filter(id => id !== vibeId)
                : [...prev.vibe, vibeId];
            return { ...prev, vibe: newVibe };
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-y-auto max-h-[70vh] md:max-h-none w-full bg-surface border border-theme shadow-2xl rounded-2xl md:backdrop-blur-2xl"
                >
                    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">

                        {/* Travelers Section */}
                        <div>
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                                {t('whoIsTraveling')}
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {travelerOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setPrefs({ ...prefs, travelers: opt.id as any })}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300",
                                            prefs.travelers === opt.id
                                                ? "bg-primary/20 border-primary text-foreground shadow-[0_0_15px_rgba(43,140,238,0.3)]"
                                                : "bg-surface-elevated border-theme text-muted-foreground hover:bg-surface hover:text-foreground"
                                        )}
                                    >
                                        <opt.icon className="w-4 h-4" />
                                        <span className="font-medium text-sm">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Vibe Section */}
                        <div>
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                                {t('vibeAndStyle')}
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {vibeOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleVibeToggle(opt.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                                            prefs.vibe.includes(opt.id)
                                                ? "bg-gradient-to-r from-primary to-cyan-500 border-transparent text-white shadow-lg"
                                                : "bg-transparent border-theme text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                        )}
                                    >
                                        <opt.icon className="w-3.5 h-3.5" />
                                        <span className="font-medium text-sm">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Budget Section */}
                            <div>
                                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                                    {t('budget')}
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {budgetOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setPrefs({ ...prefs, budget: opt.id as any })}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 text-center",
                                                prefs.budget === opt.id
                                                    ? "bg-surface-elevated border-green-500/50 text-foreground shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                                                    : "bg-surface border-theme text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                                            )}
                                        >
                                            <opt.icon className={cn(
                                                "w-5 h-5 mb-2",
                                                prefs.budget === opt.id ? "text-green-500" : "text-muted-foreground"
                                            )} />
                                            <span className="font-bold text-sm block">{opt.label}</span>
                                            <span className="text-[10px] text-muted-foreground block mt-1">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pacing Section */}
                            <div>
                                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                                    {t('tempo')}
                                </label>
                                <div className="bg-surface-elevated border border-theme rounded-xl p-6">
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="1"
                                        className="w-full h-2 bg-theme rounded-lg appearance-none cursor-pointer accent-primary"
                                        value={prefs.pacing === 'relaxed' ? 0 : prefs.pacing === 'balanced' ? 1 : 2}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setPrefs({
                                                ...prefs,
                                                pacing: val === 0 ? 'relaxed' : val === 1 ? 'balanced' : 'fast'
                                            });
                                        }}
                                    />
                                    <div className="flex justify-between mt-3 text-xs font-medium text-gray-400 uppercase">
                                        <span className={prefs.pacing === 'relaxed' ? 'text-primary' : ''}>{t('options.relaxed')}</span>
                                        <span className={prefs.pacing === 'balanced' ? 'text-primary' : ''}>{t('options.balancedTempo')}</span>
                                        <span className={prefs.pacing === 'fast' ? 'text-primary' : ''}>{t('options.fast')}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4 text-center italic">
                                        {prefs.pacing === 'relaxed' && t('options.relaxedDesc')}
                                        {prefs.pacing === 'balanced' && t('options.balancedTempoDesc')}
                                        {prefs.pacing === 'fast' && t('options.fastDesc')}
                                    </p>
                                </div>
                            </div>

                            {/* Mobility Section */}
                            <div>
                                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                                    {t('mobility')}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPrefs({ ...prefs, mobility: 'active' })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 text-center",
                                            prefs.mobility === 'active'
                                                ? "bg-surface-elevated border-orange-500/50 text-foreground shadow-[0_0_10px_rgba(251,146,60,0.2)]"
                                                : "bg-surface border-theme text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                                        )}
                                    >
                                        <Footprints className={cn(
                                            "w-5 h-5 mb-2",
                                            prefs.mobility === 'active' ? "text-orange-500" : "text-muted-foreground"
                                        )} />
                                        <span className="font-bold text-sm block">{t('options.active')}</span>
                                        <span className="text-[10px] text-muted-foreground block mt-1">{t('options.activeDesc')}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPrefs({ ...prefs, mobility: 'accessible' })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 text-center",
                                            prefs.mobility === 'accessible'
                                                ? "bg-surface-elevated border-blue-500/50 text-foreground shadow-[0_0_10px_rgba(96,165,250,0.2)]"
                                                : "bg-surface border-theme text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                                        )}
                                    >
                                        <Accessibility className={cn(
                                            "w-5 h-5 mb-2",
                                            prefs.mobility === 'accessible' ? "text-blue-500" : "text-muted-foreground"
                                        )} />
                                        <span className="font-bold text-sm block">{t('options.accessible')}</span>
                                        <span className="text-[10px] text-muted-foreground block mt-1">{t('options.accessibleDesc')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Close Handle */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-surface-elevated hover:bg-surface border-t border-theme rounded-b-2xl flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                    >
                        {t('closeSettings')}
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
