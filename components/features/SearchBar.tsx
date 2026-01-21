"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Search, ArrowRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
} from "@radix-ui/react-dialog";
import { Calendar } from "@/components/ui/calendar";
import { X } from "lucide-react";
import "react-day-picker/dist/style.css";
import { de, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    initialValue?: string;
    initialDateFrom?: string;
    initialDateTo?: string;
    initialDate?: string; // Legacy/simplicity
}

export function SearchBar({
    placeholder,
    className,
    initialValue = "",
    initialDateFrom,
    initialDateTo,
    initialDate
}: SearchBarProps) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('common');

    const [query, setQuery] = useState(initialValue);
    const [date, setDate] = useState<DateRange | undefined>(() => {
        if (initialDateFrom) {
            const from = new Date(initialDateFrom);
            if (!isNaN(from.getTime())) {
                return {
                    from,
                    to: initialDateTo ? new Date(initialDateTo) : undefined
                };
            }
        }
        if (initialDate) {
            const start = new Date(initialDate);
            if (!isNaN(start.getTime())) {
                return {
                    from: start,
                    to: undefined
                };
            }
        }
        return undefined;
    });

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();

        let url = `/search?q=${encodeURIComponent(query)}`;

        if (date?.from) {
            const fromStr = format(date.from, "yyyy-MM-dd");
            url += `&from=${fromStr}`;

            if (date.to) {
                const toStr = format(date.to, "yyyy-MM-dd");
                url += `&to=${toStr}`;
            }
        }

        router.push(url);
    };

    const formatDateDisplay = () => {
        if (!date?.from) return locale === 'de' ? "Datum wählen" : "Pick a date";

        const formatStr = "d. MMM";
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

            {/* Date Picker Modal */}
            <div className="relative flex items-center flex-1 w-full md:w-auto px-6 py-2">
                <Dialog>
                    <DialogTrigger asChild>
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
                    </DialogTrigger>
                    <DialogPortal>
                        <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
                        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-theme rounded-[2rem] shadow-2xl z-[101] p-0 overflow-hidden focus:outline-none animate-scale-in">
                            <div className="p-8">
                                <div className="flex items-center justify-center mb-8 relative">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {locale === 'de' ? "Datum auswählen" : "Select Date"}
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
                                        locale={locale === 'de' ? de : enUS}
                                        disabled={{ before: startOfToday() }}
                                        className="mx-auto"
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>
            </div>

            {/* Search Button */}
            <div className="p-1 w-full md:w-auto">
                <button
                    type="submit"
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span>{t('search')}</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
