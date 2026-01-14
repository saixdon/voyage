import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
}

export function SearchBar({
    onSearch,
    placeholder = "Where are you going?",
    initialValue = "",
}: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const router = useRouter();

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            if (onSearch) {
                onSearch(query);
            } else {
                router.push(`/search?q=${encodeURIComponent(query)}`);
            }
        }
    };

    return (
        <div className="w-full max-w-2xl group">
            <form
                onSubmit={handleSubmit}
                className="relative flex items-center w-full h-16 md:h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-full shadow-2xl transition-all duration-300 hover:bg-white/15 focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-primary/50"
            >
                <div className="pl-6 text-gray-300">
                    <span className="material-symbols-outlined text-2xl">search</span>
                </div>
                <input
                    className="w-full h-full bg-transparent border-none text-white placeholder-gray-300 text-lg px-4 focus:ring-0 font-medium outline-none"
                    placeholder={placeholder}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div className="pr-2 md:pr-3">
                    <button
                        type="submit"
                        className="h-12 md:h-14 px-8 bg-primary text-white font-bold rounded-xl md:rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30 flex items-center gap-2"
                    >
                        <span>Search</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
