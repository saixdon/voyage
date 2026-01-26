"use client";

import React, { useState } from "react";

interface AISearchAssistProps {
    onSearch: (query: string) => void;
    isProcessing?: boolean;
}

/**
 * AISearchAssist - A smart filter component using AI to refine search results
 * 
 * Design: Follows TripVega Design System
 * - Uses gradient-ai for accent styling
 * - Glass effect for premium feel
 * - Rounded-full for pill-like appearance
 */
export function AISearchAssist({ onSearch, isProcessing = false }: AISearchAssistProps) {
    const [query, setQuery] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const suggestions = [
        "Romantisches Dinner mit Aussicht",
        "Familienfreundliche Aktivitäten unter 50€",
        "Adrenalin-Abenteuer am Morgen",
        "Kulturelle Touren für Kunstliebhaber",
    ];

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 rounded-full text-sm font-medium text-foreground hover:from-primary/30 hover:to-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(43,140,238,0.25)]"
            >
                <span className="material-symbols-outlined text-lg text-primary">auto_awesome</span>
                <span>KI-Assistent</span>
                <span className="text-muted-foreground text-xs hidden sm:inline">– Natürliche Sprache nutzen</span>
            </button>
        );
    }

    return (
        <div className="w-full bg-surface-elevated/95 backdrop-blur-xl rounded-2xl border border-primary/30 ring-1 ring-primary/20 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    <span className="font-semibold text-foreground text-sm">KI-Suchhilfe</span>
                </div>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Beschreibe, wonach du suchst..."
                    disabled={isProcessing}
                    className="w-full h-12 px-4 pr-12 bg-surface border border-theme rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!query.trim() || isProcessing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-lg">send</span>
                    )}
                </button>
            </form>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground mr-1">Vorschläge:</span>
                {suggestions.map((suggestion, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setQuery(suggestion);
                            onSearch(suggestion);
                        }}
                        disabled={isProcessing}
                        className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-primary/30 transition-all disabled:opacity-50"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
}
