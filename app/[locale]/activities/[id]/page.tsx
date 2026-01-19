"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { notFound } from "next/navigation";
import type { TransformedActivity } from "@/lib/api/viator-client";
import { checkAvailabilityAction, type AvailabilityResult } from "@/app/actions/viator";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
    Calendar as CalendarIcon,
    Users,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Star,
    CheckCircle,
    Globe,
    ShieldCheck,
    Smartphone,
    Ticket,
    ImageIcon,
    X,
    Minus,
    Plus
} from "lucide-react";
import { Popover as RadixPopover, PopoverContent as RadixPopoverContent, PopoverTrigger as RadixPopoverTrigger, PopoverPortal as RadixPopoverPortal } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility
import { useLocale } from "next-intl";

interface ActivityWithBadge extends TransformedActivity {
    badge?: string;
}

export default function ActivityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const locale = useLocale(); // 'de' or 'en'

    // Data State
    const [activity, setActivity] = useState<ActivityWithBadge | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Booking State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [guestCount, setGuestCount] = useState(2);
    const [checkLoading, setCheckLoading] = useState(false);
    const [availability, setAvailability] = useState<AvailabilityResult | null>(null);

    // UI State
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        async function fetchActivity() {
            try {
                // Fetch activity details from Viator API
                const response = await fetch(`/api/activity/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setError("Activity not found");
                    } else {
                        setError("Failed to load activity");
                    }
                    return;
                }
                const data = await response.json();
                setActivity(data);
            } catch (err) {
                setError("Failed to load activity");
            } finally {
                setLoading(false);
            }
        }
        fetchActivity();
    }, [id]);

    const handleCheckAvailability = async () => {
        if (!selectedDate || !activity) return;

        setCheckLoading(true);
        setAvailability(null);

        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        try {
            const result = await checkAvailabilityAction(activity.productCode, dateStr);
            setAvailability(result);
        } catch (e) {
            console.error(e);
            setAvailability({ available: false, error: "Failed to check availability" });
        } finally {
            setCheckLoading(false);
        }
    };

    const handleBookOption = (affiliateUrl?: string, productOptionCode?: string) => {
        if (!affiliateUrl) return;

        // Enhance URL with date and pax if possible (Viator often handles this via query params on their landing)
        const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
        const separator = affiliateUrl.includes('?') ? '&' : '?';
        let finalUrl = `${affiliateUrl}${separator}date=${dateStr}&pax=${guestCount}`;

        if (productOptionCode && productOptionCode !== 'DEFAULT') {
            finalUrl += `&productOptionCode=${productOptionCode}`;
        }

        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

    const allImages = activity ? [activity.image, ...(activity.images || [])] : [];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !activity) {
        notFound();
        return null;
    }

    // Determine fallback price display
    const currentPrice = availability?.price ? availability.price.amount : activity.price;
    const currentCurrency = availability?.price ? availability.price.currency : activity.currency;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Gallery Overlay (Lightbox) */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in backdrop-blur-md">
                    <button
                        onClick={() => setIsGalleryOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 hidden md:block"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 hidden md:block"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex flex-col items-center justify-center">
                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <Image
                                src={allImages[currentImageIndex]}
                                alt={`Gallery Image ${currentImageIndex + 1}`}
                                fill
                                className="object-contain"
                                priority
                                quality={100}
                            />
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm">
                            {allImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        idx === currentImageIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/70"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section - Redesigned */}
            <div className="relative h-[65vh] min-h-[500px] w-full group">
                {/* Main Hero Image */}
                <Image
                    src={activity.image}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    priority
                    sizes="100vw"
                />

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                {/* Top Actions */}
                <div className="absolute top-24 left-0 right-0 px-6 max-w-7xl mx-auto flex justify-between items-start z-10">
                    <div /> {/* Spacer or Back Button could go here */}
                    <button
                        onClick={() => setIsGalleryOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white text-sm font-medium transition-all border border-white/10 hover:border-white/30"
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>View Photos</span>
                    </button>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-4xl animate-fade-in-up">
                            {/* Badges / Location */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {activity.badge && (
                                    <span className="bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                                        {activity.badge.replace(/-/g, " ")}
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white text-xs font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                    {activity.location}
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tigher shadow-black/50 drop-shadow-lg">
                                {activity.title}
                            </h1>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span>{activity.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center text-yellow-400">
                                        <Star className="w-5 h-5 fill-current" />
                                        <span className="ml-1 font-bold text-white">{activity.rating}</span>
                                    </div>
                                    <span className="text-white/60 text-sm">({activity.reviewCount} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8 pt-8 lg:pt-0">
                        {/* Highlights Section (Example) */}
                        <div className="bg-card/50 border border-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Star className="w-6 h-6 text-primary" />
                                Experience Highlights
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {["Skip the long lines", "Local expert guide", "Hidden gems tour", "Small group size"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-gray-200">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-card/30 rounded-2xl p-5 border border-white/5 flex items-start gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">Free Cancellation</h4>
                                    <p className="text-sm text-muted-foreground">Up to 24 hours in advance.</p>
                                </div>
                            </div>
                            <div className="bg-card/30 rounded-2xl p-5 border border-white/5 flex items-start gap-4">
                                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">Mobile Ticketing</h4>
                                    <p className="text-sm text-muted-foreground">Use your phone to enter.</p>
                                </div>
                            </div>
                            <div className="bg-card/30 rounded-2xl p-5 border border-white/5 flex items-start gap-4">
                                <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">Multilingual Guide</h4>
                                    <p className="text-sm text-muted-foreground">English, German, French...</p>
                                </div>
                            </div>
                            <div className="bg-card/30 rounded-2xl p-5 border border-white/5 flex items-start gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">Instant Confirmation</h4>
                                    <p className="text-sm text-muted-foreground">Tickets sent to email.</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-white/10 my-8" />

                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-2xl font-bold mb-4">Full Description</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {activity.title} offers an unforgettable journey through the heart of {activity.location}.
                                Immerse yourself in the local culture, history, and vibrant atmosphere.
                                Whether you're a history buff, a foodie, or an adventure seeker, this experience has something for everyone.
                            </p>
                            <p className="text-gray-300 leading-relaxed mt-4">
                                Our expert guides will take you off the beaten path to discover hidden gems that most tourists miss.
                                Enjoy personalized attention in generic terms for this placeholder description, ensuring a memorable and intimate experience.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="lg:col-span-1 relative">
                        <div className="sticky top-28 bg-surface border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden ring-1 ring-white/5">
                            {/* Decorative gradient blob */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10 rounded-full pointer-events-none" />

                            {/* Price Header */}
                            <div className="mb-6">
                                <p className="text-sm text-muted-foreground mb-1">Price starts from</p>
                                <div className="flex items-baseline gap-2">
                                    {currentPrice > 0 ? (
                                        <>
                                            <span className="text-3xl lg:text-4xl font-bold text-white">
                                                {currentCurrency} {currentPrice}
                                            </span>
                                            <span className="text-muted-foreground text-sm">/ person</span>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-white">Check Availability</span>
                                    )}
                                </div>
                            </div>

                            {/* Booking Form */}
                            <div className="space-y-4">
                                {/* Date Picker - Popover */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date</label>
                                    <RadixPopover>
                                        <RadixPopoverTrigger asChild>
                                            <button className={cn(
                                                "w-full flex items-center justify-between px-4 py-3.5 bg-black/20 hover:bg-black/40 border border-white/10 hover:border-primary/50 rounded-xl transition-all text-left",
                                                !selectedDate && "text-muted-foreground"
                                            )}>
                                                <div className="flex items-center gap-3">
                                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                                    <span className="font-medium">
                                                        {selectedDate
                                                            ? format(selectedDate, "dd. MMM yyyy", { locale: locale === 'de' ? de : enUS })
                                                            : "Select a date"}
                                                    </span>
                                                </div>
                                                <ChevronDown className="w-4 h-4 opacity-50" />
                                            </button>
                                        </RadixPopoverTrigger>
                                        <RadixPopoverPortal>
                                            <RadixPopoverContent className="w-auto p-0 bg-surface border border-white/10 rounded-2xl shadow-2xl z-[50]" align="start" sideOffset={8}>
                                                <div className="p-3">
                                                    <DayPicker
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={(d) => {
                                                            setSelectedDate(d);
                                                            setAvailability(null); // Reset availability on date change
                                                        }}
                                                        disabled={{ before: new Date() }}
                                                        modifiersClassNames={{
                                                            selected: "bg-primary text-white hover:bg-primary/90",
                                                            today: "text-primary font-bold"
                                                        }}
                                                    />
                                                </div>
                                            </RadixPopoverContent>
                                        </RadixPopoverPortal>
                                    </RadixPopover>
                                </div>

                                {/* Guest Selector - Popover */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Guests</label>
                                    <RadixPopover>
                                        <RadixPopoverTrigger asChild>
                                            <button className="w-full flex items-center justify-between px-4 py-3.5 bg-black/20 hover:bg-black/40 border border-white/10 hover:border-primary/50 rounded-xl transition-all text-left">
                                                <div className="flex items-center gap-3">
                                                    <Users className="w-5 h-5 text-primary" />
                                                    <span className="font-medium">
                                                        {guestCount} {guestCount === 1 ? 'Adult' : 'Adults'}
                                                    </span>
                                                </div>
                                                <ChevronDown className="w-4 h-4 opacity-50" />
                                            </button>
                                        </RadixPopoverTrigger>
                                        <RadixPopoverPortal>
                                            <RadixPopoverContent className="w-64 p-4 bg-surface border border-white/10 rounded-2xl shadow-2xl z-[50]" align="start" sideOffset={8}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">Adults</span>
                                                    <div className="flex items-center gap-3 bg-black/20 rounded-lg p-1">
                                                        <button
                                                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                                            disabled={guestCount <= 1}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-4 text-center font-bold text-sm">{guestCount}</span>
                                                        <button
                                                            onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                                                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </RadixPopoverContent>
                                        </RadixPopoverPortal>
                                    </RadixPopover>
                                </div>

                                {/* Check Button or Loader */}
                                {!availability?.bookableItems ? (
                                    <Button
                                        size="lg"
                                        className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 mt-4 rounded-xl shadow-lg shadow-primary/20"
                                        onClick={handleCheckAvailability}
                                        disabled={!selectedDate || checkLoading}
                                    >
                                        {checkLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></span>
                                                Checking Availability...
                                            </span>
                                        ) : (
                                            "Check Availability"
                                        )}
                                    </Button>
                                ) : null}
                            </div>

                            {/* RESULTS: Error Message */}
                            {availability?.available === false && (
                                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center animate-fade-in">
                                    <div className="font-bold mb-1">Not Available</div>
                                    <p className="text-red-300/70">Please try another date.</p>
                                </div>
                            )}

                            {/* RESULTS: Options List */}
                            {availability?.bookableItems && availability.bookableItems.length > 0 && (
                                <div className="mt-6 space-y-3 animate-fade-in">
                                    <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Available Options
                                    </div>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                        {availability.bookableItems.map((item: any, idx) => (
                                            <div key={idx} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-xl p-3 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-sm text-white mb-0.5">
                                                            {item.productOptionCode === 'DEFAULT' ? 'Standard Ticket' : item.productOptionCode}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {item.startTime || 'Flexible Time'}
                                                        </div>
                                                    </div>
                                                    {item.price?.totalPrice?.price?.value && (
                                                        <div className="font-bold text-primary">
                                                            {item.price.totalPrice.price.currency} {item.price.totalPrice.price.value}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    className="w-full h-9 text-sm bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary transition-all"
                                                    onClick={() => handleBookOption(availability.affiliateUrl, item.productOptionCode)}
                                                >
                                                    Book Now
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer Trust */}
                            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Secure Booking
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" />
                                    Viator Partner
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
