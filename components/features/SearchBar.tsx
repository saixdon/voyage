"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
    initialDateFrom?: string;
    initialDateTo?: string;
    // Keeping initialDate for backwards compatibility/simplicity if only a single date was passed
    initialDate?: string;
}

export function SearchBar({
    onSearch,
    placeholder = "Where are you going?",
    initialValue = "",
    initialDateFrom,
    initialDateTo,
    initialDate,
}: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const router = useRouter();

    // Initialize state from props
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (initialDateFrom) {
            return {
                from: new Date(initialDateFrom),
                to: initialDateTo ? new Date(initialDateTo) : undefined,
            };
        }
        if (initialDate) {
            return {
                from: new Date(initialDate),
                to: undefined
            };
        }
        return undefined;
    });

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (query.trim() || dateRange?.from) {
            if (onSearch) {
                onSearch(query);
            } else {
                let url = `/search?q=${encodeURIComponent(query)}`;

                if (dateRange?.from) {
                    // Send as canonical date format like YYYY-MM-DD
                    // Using format() from date-fns which respects local time, but we usually want YYYY-MM-DD
                    const fromStr = format(dateRange.from, "yyyy-MM-dd");
                    url += `&from=${fromStr}`;

                    if (dateRange.to) {
                        const toStr = format(dateRange.to, "yyyy-MM-dd");
                        url += `&to=${toStr}`;
                    } else {
                        // If only one date is picked, maybe we treat it as single day? 
                        // Or just from=...
                    }
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
                {/* Search Icon */}
                <div className="pl-4 md:pl-6 text-gray-300 shrink-0">
                    <span className="material-symbols-outlined text-2xl">search</span>
                </div>

                {/* Text Input */}
                <input
                    className="flex-1 min-w-0 h-full bg-transparent border-none text-white placeholder-gray-300 text-lg px-4 focus:ring-0 font-medium outline-none"
                    placeholder={placeholder}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-white/20 mx-2 hidden md:block shrink-0"></div>

                {/* Date Popover Trigger */}
                <div className="relative shrink-0 flex items-center pr-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    "flex items-center gap-2 text-left font-medium transition-colors hover:text-primary outline-none",
                                    !dateRange ? "text-gray-300" : "text-white"
                                )}
                            >
                                <CalendarIcon className="h-5 w-5" />
                                <span className="hidden md:inline-block text-sm md:text-base whitespace-nowrap min-w-[100px]">
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                className="bg-card-dark border-white/10 text-white"
                                classNames={{
                                    day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                                    day_today: "bg-white/10 text-white",
                                    day: "text-white hover:bg-white/10 rounded-md",
                                    head_cell: "text-gray-400 font-normal",
                                    caption_label: "text-white font-medium",
                                    nav_button: "border-white/10 hover:bg-white/10 text-white",
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Submit Button */}
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
