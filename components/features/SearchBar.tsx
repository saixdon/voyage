"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Search, MapPin, ArrowRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { de, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    initialValue?: string;
    initialDate?: string; // YYYY-MM-DD
}

export function SearchBar({ placeholder, className, initialValue = "", initialDate }: SearchBarProps) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('common');

    const [query, setQuery] = React.useState(initialValue);
    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        if (initialDate) {
            const start = new Date(initialDate);
            if (!isNaN(start.getTime())) {
                return {
                    from: start,
                    to: addDays(start, 3) // Default to 3 days if single date provided
                };
            }
        }
        return {
            from: new Date(),
            to: addDays(new Date(), 3),
        };
    });

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            const params = new URLSearchParams();
            params.set("q", query);
            if (date?.from) params.set("from", date.from.toISOString());
            if (date?.to) params.set("to", date.to.toISOString());

            router.push(`/search?${params.toString()}`);
        }
    };

    // Format date specifically without year for short-term booking focus
    // e.g. "18. Jan - 21. Jan"
    const formatDateDisplay = () => {
        if (!date?.from) return locale === 'de' ? "Datum wählen" : "Pick a date";

        const formatStr = "d. MMM"; // No year!
        const localeObj = locale === 'de' ? de : enUS;

        let display = format(date.from, formatStr, { locale: localeObj });

        if (date.to) {
            display += ` - ${format(date.to, formatStr, { locale: localeObj })}`;
        }

        return display;
    };

    return (
        <form
            onSubmit={handleSearch}
            className={cn(
                "flex flex-col md:flex-row items-center p-2 bg-surface-elevated/80 backdrop-blur-xl rounded-full shadow-2xl max-w-3xl w-full border border-primary/30 ring-1 ring-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
                className
            )}
        >
            {/* Destination Input */}
            <div className="relative flex items-center flex-1 w-full md:w-auto px-6 py-2 border-b md:border-b-0 md:border-r border-theme">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder || (locale === 'de' ? "Wohin geht's?" : "Where are you going?")}
                    className="w-full text-base font-medium text-foreground placeholder:text-muted-foreground outline-none bg-transparent truncate"
                />
            </div>

            {/* Date Picker */}
            <div className="relative flex items-center flex-1 w-full md:w-auto px-6 py-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "flex items-center w-full text-left outline-none group",
                                !date ? "text-muted-foreground" : "text-foreground"
                            )}
                        >
                            <CalendarIcon className="w-5 h-5 text-muted-foreground mr-3 group-hover:text-primary transition-colors" />
                            <span className={cn(
                                "text-base font-medium truncate",
                                date ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {formatDateDisplay()}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto bg-surface border border-theme rounded-2xl shadow-2xl z-50 p-4 text-foreground" align="center">
                        <DayPicker
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={1}
                            modifiersClassNames={{
                                selected: "bg-primary text-white hover:bg-primary/90 rounded-md",
                                today: "text-primary font-bold",
                                range_middle: "bg-primary/20 text-foreground rounded-none",
                                range_start: "bg-primary text-white rounded-l-md",
                                range_end: "bg-primary text-white rounded-r-md"
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Search Button */}
            <div className="p-1 w-full md:w-auto">
                <button
                    type="submit"
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span className="md:hidden">{t('search')}</span>
                    <span className="hidden md:inline">{t('search')}</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
