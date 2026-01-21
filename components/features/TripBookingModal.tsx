"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { startOfToday, isBefore, format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useLocale, useTranslations } from "next-intl";
import { Calendar as CalendarIcon, X, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { TripActivity } from "@/app/actions/ai-planner";
import { checkAvailabilityAction } from "@/app/actions/viator";
import { generateAffiliateLink } from "@/lib/api/viator-affiliate";

interface TripBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: TripActivity;
    initialDate?: Date;
    travelerCount?: number;
    tripId?: string;
    itemDbId?: string;
    onBooked: () => void;
}

type Step = 'date' | 'checking' | 'options' | 'confirm';

export function TripBookingModal({ isOpen, onClose, activity, initialDate, travelerCount, tripId, itemDbId, onBooked }: TripBookingModalProps) {
    const t = useTranslations('aiPlan'); // Using same namespace
    const locale = useLocale();

    const [step, setStep] = useState<Step>('date');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
    const [guests, setGuests] = useState(travelerCount || 2);
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            const today = startOfToday();

            // Validate initialDate - if in past, reset to undefined
            let validInitialDate = initialDate;
            if (initialDate && isBefore(initialDate, today)) {
                validInitialDate = undefined;
            }

            setSelectedDate(validInitialDate);
            setGuests(travelerCount || 2);
            setStep(validInitialDate ? 'checking' : 'date');
            setError(null);

            // Auto-check if date is already there
            if (validInitialDate) {
                checkAvailability(validInitialDate);
            }
        }
    }, [isOpen, initialDate, travelerCount]);

    const checkAvailability = async (date: Date) => {
        setLoading(true);
        setStep('checking');
        setError(null);

        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const result = await checkAvailabilityAction(activity.productCode, dateStr);

            if (result.error || result.available === false) {
                // If not available or error
                setError(result.error || "Not available on this date. Please choose another.");
                setOptions([]);
                setStep('date');
            } else {
                const items = result.bookableItems || [];
                setOptions(items);

                // If options exist, show them. If not, just confirm.
                if (items.length > 0) {
                    setStep('options');
                } else {
                    setStep('confirm');
                }
            }
        } catch (err) {
            console.error(err);
            // Fallback
            setStep('confirm');
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            checkAvailability(date);
        }
    };

    const handleBooking = (option?: any) => {
        // Construct URL
        let url = activity.productUrl;
        const separator = url.includes('?') ? '&' : '?';
        const uid = tripId && itemDbId ? `${tripId}_${itemDbId}` : undefined;

        let finalUrl = url;

        if (!url.startsWith('https://www.viator.com')) {
            finalUrl = generateAffiliateLink(
                `https://www.viator.com${url.startsWith('/') ? url : '/' + url}`,
                tripId && itemDbId ? `${tripId}_${itemDbId}` : undefined
            );
        } else if (uid) {
            finalUrl = `${url}${separator}uid=${uid}`;
        }

        // Add Params
        const params: string[] = [];
        if (selectedDate) {
            params.push(`date=${format(selectedDate, 'yyyy-MM-dd')}`);
        }
        if (guests) {
            params.push(`pax=${guests}`);
        }

        // If option selected (e.g. time), try to find a param. 
        // Viator usually takes 'time' or 'optionCode' ???
        // Without deep link doc specifics, we can't guarantee 'optionCode' param works.
        // But showing the user "Available at 10:00" and then linking them with Date/Pax is better than nothing.
        // If we found a standard way, we'd add it. 
        // For now, we rely on Date/Pax.

        if (params.length > 0) {
            const finalSeparator = finalUrl.includes('?') ? '&' : '?';
            finalUrl = `${finalUrl}${finalSeparator}${params.join('&')}`;
        }

        window.open(finalUrl, '_blank', 'noopener,noreferrer');
        onBooked();
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full bg-surface border border-theme rounded-3xl p-6 shadow-2xl z-50 animate-scale-in focus:outline-none">
                    <div className="absolute right-4 top-4">
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <Dialog.Title className="text-xl font-bold text-foreground mb-1 text-center">
                        {step === 'date' ? t('selectDate') :
                            step === 'options' ? 'Select Option' :
                                step === 'checking' ? 'Checking Availability...' :
                                    'Confirm Booking'}
                    </Dialog.Title>

                    <div className="mt-6">
                        {step === 'checking' && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mb-4"></div>
                                <p className="text-muted-foreground">{t('findingAlternative') || 'Checking availability...'}</p>
                            </div>
                        )}

                        {step === 'date' && (
                            <div className="flex flex-col items-center">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}
                                <div className="bg-surface-hover/50 rounded-xl p-2 mb-4">
                                    <DayPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateSelect}
                                        numberOfMonths={1}
                                        locale={locale === 'de' ? de : enUS}
                                        disabled={{ before: startOfToday() }}
                                        defaultMonth={selectedDate || startOfToday()}
                                        modifiersClassNames={{
                                            selected: "bg-primary text-white hover:bg-primary/90 rounded-md",
                                            today: "text-primary font-bold"
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 'options' && (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                <p className="text-sm text-center text-muted-foreground mb-4">
                                    {format(selectedDate!, 'EEEE, d. MMMM', { locale: locale === 'de' ? de : enUS })} • {guests} Guests
                                </p>

                                {options.length > 0 ? (
                                    options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleBooking(opt)}
                                            className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-primary/50 bg-black/20 hover:bg-black/40 transition-all flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    {opt.startTime && (
                                                        <span className="flex items-center gap-1 text-primary">
                                                            <Clock className="w-4 h-4" />
                                                            {opt.startTime}
                                                        </span>
                                                    )}
                                                    {opt.productOptionCode && <span className="text-xs text-muted-foreground">{opt.productOptionCode}</span>}
                                                </div>
                                                {opt.description && <div className="text-sm text-muted-foreground mt-1">{opt.description}</div>}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                                <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary">arrow_forward</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No specific times found.
                                        <button
                                            onClick={() => handleBooking()}
                                            className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-bold"
                                        >
                                            Proceed anyway
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep('date')}
                                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground mt-2"
                                >
                                    Change Date
                                </button>
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div className="text-center">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <p className="mb-6 text-lg">
                                    Ready to book for <b>{format(selectedDate!, 'd. MMM', { locale: locale === 'de' ? de : enUS })}</b>?
                                </p>
                                <button
                                    onClick={() => handleBooking()}
                                    className="w-full py-3 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                >
                                    {t('continueBooking')}
                                </button>
                                <button
                                    onClick={() => setStep('date')}
                                    className="mt-3 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Change Date
                                </button>
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
