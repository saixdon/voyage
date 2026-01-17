"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
    initialDate?: string;
}

export function SearchBar({
    onSearch,
    placeholder = "Where are you going?",
    initialValue = "",
    initialDate = "",
}: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const [date, setDate] = useState(initialDate);
    const router = useRouter();

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        // Ensure at least a query or date is provided to search
        if (query.trim() || date) {
            if (onSearch) {
                // If onSearch is provided, we assume it might not handle date yet, 
                // but usually onSearch is for client-side filtering or custom handling.
                // We'll stick to redirect logic if no custom handler or update custom handler if needed.
                // For now, let's treat the simple case.
                onSearch(query);
            } else {
                let url = `/search?q=${encodeURIComponent(query)}`;
                if (date) {
                    url += `&date=${encodeURIComponent(date)}`;
                }
                router.push(url);
            }
        }
    };

    return (
        <div className="w-full max-w-3xl group">
            <form
                onSubmit={handleSubmit}
                className="relative flex items-center w-full h-16 md:h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-full shadow-2xl transition-all duration-300 hover:bg-white/15 focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-primary/50"
            >
                <div className="pl-4 md:pl-6 text-gray-300 shrink-0">
                    <span className="material-symbols-outlined text-2xl">search</span>
                </div>
                <input
                    className="flex-1 min-w-0 h-full bg-transparent border-none text-white placeholder-gray-300 text-lg px-4 focus:ring-0 font-medium outline-none"
                    placeholder={placeholder}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-white/20 mx-2 hidden md:block shrink-0"></div>

                {/* Date Input */}
                <div className="relative shrink-0 flex items-center">
                    <input
                        type="date"
                        className="bg-transparent border-none text-white text-sm md:text-base px-2 md:px-4 focus:ring-0 font-medium outline-none w-[130px] md:w-auto [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="pr-2 md:pr-3 shrink-0">
                    <button
                        type="submit"
                        className="h-12 md:h-14 px-6 md:px-8 bg-primary text-white font-bold rounded-xl md:rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30 flex items-center gap-2"
                    >
                        <span className="hidden md:inline">Search</span>
                        <span className="md:hidden material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
