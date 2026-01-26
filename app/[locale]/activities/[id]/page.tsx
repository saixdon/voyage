"use client";

import React, { use, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { notFound, useRouter } from "next/navigation";
import type { TransformedActivity } from "@/lib/api/viator-client";
import { checkAvailabilityAction, type AvailabilityResult, type SimilarProduct } from "@/app/actions/viator";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useFavorites } from "@/lib/favorites/favorites-context";
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
    Plus,
    Zap,
    Heart,
    Share2,
    Info,
    MessageCircle,
    Navigation,
    User,
    Ban,
    AlertCircle,
    Check
} from "lucide-react";
import { Popover as RadixPopover, PopoverContent as RadixPopoverContent, PopoverTrigger as RadixPopoverTrigger, PopoverPortal as RadixPopoverPortal } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { ActivityMap } from "@/components/features/ActivityMap";

interface ProductOption {
    productOptionCode: string;
    description: string;
    title: string;
    languageGuides?: { language: string; type: string }[];
}

interface ActivityWithBadge extends TransformedActivity {
    badge?: string;
    lat?: number;
    lng?: number;
    productOptions?: ProductOption[];
    userReviews?: any[];
    reviewsStats?: {
        reviewCountTotals?: { rating: number; count: number }[];
        totalReviews?: number;
        combinedAverageRating?: number;
    };
}

interface DisplayReview {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    avatar?: string;
    photos?: string[];
}

export default function ActivityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const locale = useLocale();
    const router = useRouter();

    const [activity, setActivity] = useState<ActivityWithBadge | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
    const [selectedOptionCode, setSelectedOptionCode] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [travelers, setTravelers] = useState({
        adults: 2,
        children: 0,
        infants: 0
    });
    const [checkLoading, setCheckLoading] = useState(false);
    const [availability, setAvailability] = useState<AvailabilityResult | null>(null);

    const totalTravelers = travelers.adults + travelers.children + travelers.infants;

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
    const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
    const [showTravelersPopover, setShowTravelersPopover] = useState(false);
    const [showCalendarPopover, setShowCalendarPopover] = useState(false);

    // Date bar state
    const [dateRange, setDateRange] = useState<Date[]>([]);

    useEffect(() => {
        const dates = [];
        const today = startOfToday();
        for (let i = 0; i < 7; i++) {
            dates.push(addDays(today, i));
        }
        setDateRange(dates);
    }, []);

    // Get current band prices for display in selectors
    const getBandPrice = (ageBand: string) => {
        if (!availability?.priceBreakdown) return null;
        const found = availability.priceBreakdown.find(b => b.ageBand === ageBand);
        if (!found) return null;
        return found.price;
    };

    const toggleHelpful = (reviewId: string) => {
        const newSet = new Set(helpfulReviews);
        if (newSet.has(reviewId)) {
            newSet.delete(reviewId);
        } else {
            newSet.add(reviewId);
        }
        setHelpfulReviews(newSet);
    };

    useEffect(() => {
        if (activity?.productOptions && activity.productOptions.length > 0 && !selectedOptionCode) {
            setSelectedOptionCode(activity.productOptions[0].productOptionCode);
        }
    }, [activity, selectedOptionCode]);

    const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
    const isFavorite = activity ? checkIsFavorite(activity.id) : false;

    const [reviews, setReviews] = useState<DisplayReview[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const REVIEWS_PER_PAGE = 10;

    useEffect(() => {
        async function fetchActivity() {
            try {
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

    useEffect(() => {
        if (activity?.userReviews && activity.userReviews.length > 0) {
            const transformedReviews: DisplayReview[] = activity.userReviews.map((r: any, idx: number) => ({
                id: r.reviewReference || `review-${idx}`,
                author: r.userName || "Verified Traveler",
                rating: r.rating || 5,
                date: r.publishedDate || new Date().toISOString(),
                comment: r.text || r.title || "No textual review provided.",
                avatar: undefined,
                photos: r.photos?.map((p: any) => p.url) ||
                    r.photosInfo?.flatMap((pi: any) => pi.photoVersions?.map((pv: any) => pv.url)) ||
                    []
            }));
            setReviews(transformedReviews);
            setHasMoreReviews(activity.reviewCount > transformedReviews.length);
        } else {
            setReviews([]);
            setHasMoreReviews(false);
        }
    }, [activity]);

    const handleCheckAvailability = async (targetDate?: Date) => {
        const dateToUse = targetDate || selectedDate;
        if (!dateToUse || !activity) return;

        if (targetDate) setSelectedDate(targetDate);

        setCheckLoading(true);
        setAvailability(null);
        const dateStr = format(dateToUse, 'yyyy-MM-dd');
        try {
            const result = await checkAvailabilityAction(
                activity.productCode,
                dateStr,
                totalTravelers,
                activity.location,
                selectedOptionCode || undefined,
                travelers
            );
            setAvailability(result);

            // Auto-scroll to options section if it was a manual check
            if (!targetDate) {
                setTimeout(() => {
                    document.getElementById('options-section')?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                }, 100);
            }
        } catch (e) {
            console.error(e);
            setAvailability({ available: false, error: "Failed to check availability" });
        } finally {
            setCheckLoading(false);
        }
    };

    const handleBookOption = (affiliateUrl?: string, productOptionCode?: string) => {
        if (!activity || !selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const price = availability?.price?.amount || activity.price;
        const currency = availability?.price?.currency || activity.currency;

        const checkoutParams = new URLSearchParams({
            productCode: activity.productCode,
            title: encodeURIComponent(activity.title),
            image: encodeURIComponent(activity.image),
            date: dateStr,
            pax: totalTravelers.toString(),
            adults: travelers.adults.toString(),
            children: travelers.children.toString(),
            infants: travelers.infants.toString(),
            price: price.toString(),
            currency: currency,
            optionCode: productOptionCode || selectedOptionCode || 'DEFAULT',
            time: selectedTime || ''
        });

        router.push(`/checkout?${checkoutParams.toString()}`);
    };

    const allImages = activity ? [activity.image, ...(activity.images || [])] : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !activity) {
        notFound();
        return null;
    }

    const displayPrice = availability?.price ? (availability.price.amount / totalTravelers) : activity.price;
    const displayCurrency = availability?.price ? availability.price.currency : activity.currency;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            {/* Review Lightbox */}
            {selectedReviewImage && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-md" onClick={() => setSelectedReviewImage(null)}>
                    <X className="absolute top-6 right-6 w-8 h-8 text-white cursor-pointer" />
                    <div className="relative w-full h-full max-w-5xl max-h-[90vh] p-4 flex items-center justify-center">
                        <Image src={selectedReviewImage} alt="Review" width={1200} height={900} className="object-contain max-h-full max-w-full rounded-md shadow-2xl" />
                    </div>
                </div>
            )}

            {/* Gallery Overlay */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-xl">
                    <X onClick={() => setIsGalleryOpen(false)} className="absolute top-6 right-6 w-8 h-8 text-white cursor-pointer group-hover:rotate-90 transition-transform" />
                    <div className="absolute top-6 left-6 text-white/60 font-medium">{currentImageIndex + 1} / {allImages.length}</div>
                    <ChevronLeft onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p - 1 + allImages.length) % allImages.length) }} className="absolute left-6 w-10 h-10 text-white cursor-pointer hidden md:block" />
                    <ChevronRight onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p + 1) % allImages.length) }} className="absolute right-6 w-10 h-10 text-white cursor-pointer hidden md:block" />
                    <div className="relative w-full h-[80vh] flex items-center justify-center px-4">
                        <Image src={allImages[currentImageIndex]} alt="Gallery" fill className="object-contain" priority />
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                        <span>Activities</span> <ChevronRight className="w-3 h-3" />
                        <span>{activity.location}</span> <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground/40">{activity.badge || "Experience"}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1] mb-6">{activity.title}</h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-5 h-5", i < Math.floor(activity.rating) ? "fill-current" : "text-border")} />
                                        ))}
                                    </div>
                                    <span className="font-bold text-lg">{activity.rating}</span>
                                    <span className="text-muted-foreground font-medium">({activity.reviewCount} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground font-medium"><MapPin className="w-5 h-5 text-primary" />{activity.location}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button onClick={() => toggleFavorite({
                                activity_id: activity.id,
                                activity_title: activity.title,
                                activity_image: activity.image,
                                activity_location: activity.location,
                                activity_price: activity.price,
                                activity_currency: activity.currency,
                                activity_rating: activity.rating,
                                activity_review_count: activity.reviewCount,
                                activity_duration: activity.duration
                            })} variant="secondary" className="rounded-full gap-2 font-bold bg-surface border-theme text-foreground hover:bg-surface-elevated">
                                <Heart className={cn("w-5 h-5", isFavorite && "fill-current text-red-500")} /> {isFavorite ? "Saved" : "Save"}
                            </Button>
                            <Button variant="secondary" className="rounded-full gap-2 font-bold bg-surface border-theme text-foreground hover:bg-surface-elevated"><Share2 className="w-5 h-5" /> Share</Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[450px] md:h-[600px] mb-12 rounded-[2rem] overflow-hidden cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
                    <div className="md:col-span-2 md:row-span-2 relative h-full overflow-hidden">
                        <Image src={activity.image} alt={activity.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority />
                    </div>
                    {allImages.slice(1, 5).map((img, i) => (
                        <div key={i} className="hidden md:block relative h-full overflow-hidden">
                            <Image src={img} alt={`Detail ${i}`} fill className="object-cover" />
                            {i === 3 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-white">Show all photos</div>}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8 space-y-16">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-[2rem] bg-surface border border-theme">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold"><Clock className="w-5 h-5" /><span className="text-xs uppercase">Duration</span></div>
                                <p className="font-extrabold">{activity.duration}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold"><ShieldCheck className="w-5 h-5" /><span className="text-xs uppercase">Cancellation</span></div>
                                <p className="font-extrabold">Free (24h)</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold"><Ticket className="w-5 h-5" /><span className="text-xs uppercase">Mobile</span></div>
                                <p className="font-extrabold">Instant Ticket</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold"><Globe className="w-5 h-5" /><span className="text-xs uppercase">Languages</span></div>
                                <p className="font-extrabold">EN, DE</p>
                            </div>
                        </div>

                        <section>
                            <h3 className="text-2xl md:text-3xl font-black mb-8">Experience Highlights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {["Skip the long lines", "Local expert guide", "Intimate groups", "Special access"].map((highlight, i) => (
                                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-surface/50 border border-theme">
                                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                                        <span className="font-medium">{highlight}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl md:text-3xl font-black mb-8">Full Description</h3>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <p>{activity.description || "No description available."}</p>
                            </div>
                        </section>

                        {/* Availability Bar Section */}
                        <section className="space-y-8">
                            <h3 className="text-2xl md:text-3xl font-black">Check availability</h3>
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                {dateRange.map((date, idx) => {
                                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleCheckAvailability(date)}
                                            className={cn(
                                                "flex-shrink-0 w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all",
                                                isSelected
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                                                    : "bg-surface border-theme text-foreground hover:border-primary/50"
                                            )}
                                        >
                                            <span className="text-[10px] uppercase font-bold opacity-60 mb-1">{format(date, 'eee', { locale: locale === 'de' ? de : enUS })}</span>
                                            <span className="text-2xl font-black">{format(date, 'd')}</span>
                                            <span className="text-[10px] uppercase font-bold opacity-60 mt-1">{format(date, 'MMM')}</span>
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setShowCalendarPopover(true)}
                                    className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-theme bg-surface flex flex-col items-center justify-center hover:border-primary/50"
                                >
                                    <CalendarIcon className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] font-bold">More dates</span>
                                </button>
                            </div>
                        </section>

                        {/* Options / PackagesSection */}
                        <section id="options-section" className="space-y-8">
                            <h3 className="text-2xl md:text-3xl font-black">Please select an option</h3>
                            {!availability ? (
                                <div className="p-12 rounded-[2rem] bg-surface-elevated border-2 border-dashed border-theme flex flex-col items-center justify-center text-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CalendarIcon className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-black text-xl">Check availability to see options</p>
                                        <p className="text-muted-foreground">Select a date and travelers to see real-time prices.</p>
                                    </div>
                                </div>
                            ) : availability.available ? (
                                <div className="space-y-4">
                                    {availability.bookableItems?.map((item, idx) => {
                                        const optionDetails = activity.productOptions?.find(o => o.productOptionCode === item.productOptionCode);
                                        const itemPrice = item.totalPrice?.price?.value || item.price?.amount || 0;
                                        const itemCurrency = item.totalPrice?.price?.currency || item.price?.currency || activity.currency;
                                        const pricePerNum = itemPrice / totalTravelers;

                                        return (
                                            <div key={idx} className="group overflow-hidden rounded-[2rem] bg-surface-elevated border border-theme shadow-lg hover:border-primary/50 transition-all duration-300">
                                                <div className="p-8 flex flex-col md:flex-row gap-8">
                                                    <div className="flex-1 space-y-6">
                                                        <div>
                                                            <h4 className="text-2xl font-black mb-3">{optionDetails?.title || item.productOptionCode}</h4>
                                                            <div className="text-sm text-muted-foreground leading-relaxed">
                                                                <p className="line-clamp-2 italic">{optionDetails?.description || "Experience the best of this location with a dedicated guide and priority access."}</p>
                                                                <button className="text-primary font-bold hover:underline mt-1">Read more</button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="flex items-center gap-3 text-sm font-bold">
                                                                <User className="w-4 h-4 text-primary" />
                                                                <span>Guide: English</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm font-bold">
                                                                <Clock className="w-4 h-4 text-primary" />
                                                                <span>{item.duration || activity.duration}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm font-bold col-span-full">
                                                                <Navigation className="w-4 h-4 text-primary" />
                                                                <span className="line-clamp-1">Meet at {activity.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:w-64 flex flex-col justify-between items-end gap-6 pt-4 md:pt-0">
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">From</p>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-3xl font-black">{itemCurrency} {pricePerNum.toFixed(2)}</span>
                                                                <span className="text-xs font-bold text-muted-foreground italic">per person</span>
                                                            </div>
                                                        </div>

                                                        <div className="w-full space-y-3">
                                                            <Button
                                                                onClick={() => handleBookOption(availability.affiliateUrl, item.productOptionCode)}
                                                                className="w-full h-12 rounded-full font-black text-lg bg-primary hover:bg-primary-dark"
                                                            >
                                                                Select
                                                            </Button>
                                                            <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-green-600 dark:text-green-400">
                                                                <CheckCircle className="w-3 h-3" />
                                                                <span>Free cancellation</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 rounded-[2rem] bg-orange-500/5 border-2 border-orange-500/20 text-center">
                                    <p className="font-black text-xl text-orange-600">Sold out for this date</p>
                                    <p className="text-muted-foreground mt-2">Try selecting another date to find availability.</p>
                                </div>
                            )}
                        </section>

                        {/* Extra info sections from Reference Image */}
                        <section className="space-y-12 border-t border-theme pt-12">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <h4 className="font-black text-xl">Includes</h4>
                                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {["Priority access to sites", "Expert local guide", "Headsets for hearing guide", "Taxes and fees"].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-medium">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <h4 className="font-black text-xl">Not suitable for</h4>
                                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {["People with mobility impairments", "Wheelchair users"].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-medium">
                                            <Ban className="w-4 h-4 text-red-500" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <h4 className="font-black text-xl">Meeting point</h4>
                                <div className="md:col-span-3 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Main Entrance</p>
                                            <p className="text-sm text-muted-foreground">{activity.location}, High Street No:10, 34093 City Center</p>
                                            <button className="text-primary text-xs font-bold hover:underline mt-1">Open in Google Maps</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <h4 className="font-black text-xl">Important information</h4>
                                <div className="md:col-span-3 space-y-6">
                                    <div className="flex gap-4">
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                        <div className="space-y-2">
                                            <p className="font-bold">What to bring</p>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                <li>Comfortable shoes</li>
                                                <li>Water</li>
                                                <li>ID card or Passport</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Ban className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <div className="space-y-2">
                                            <p className="font-bold">Not allowed</p>
                                            <p className="text-sm text-muted-foreground">Short skirts, Oversize luggage, Sleeveless shirts</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <ActivityMap location={activity.location} lat={activity.lat} lng={activity.lng} className="rounded-3xl h-[400px]" />

                        <section id="reviews">
                            <h3 className="text-2xl md:text-3xl font-black mb-8">Reviews</h3>
                            <div className="space-y-8">
                                {reviews.slice(0, showAllReviews ? undefined : 3).map((review) => (
                                    <div key={review.id} className="pb-8 border-b border-theme/50 last:border-0 hover:bg-surface/30 p-4 rounded-2xl transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{review.author.charAt(0)}</div>
                                                <div>
                                                    <div className="font-bold">{review.author}</div>
                                                    <div className="text-xs text-muted-foreground">{format(new Date(review.date), 'MMMM yyyy')}</div>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-current" : "text-border")} />)}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground italic leading-relaxed">"{review.comment}"</p>
                                        {review.photos && review.photos.length > 0 && (
                                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                                {review.photos.map((photo, pIdx) => (
                                                    <div key={pIdx} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setSelectedReviewImage(photo)}>
                                                        <Image src={photo} alt="Review" fill className="object-cover transition-transform hover:scale-110" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center gap-4 text-xs font-bold text-muted-foreground">
                                            <button className="flex items-center gap-1 hover:text-primary transition-colors">Helpful</button>
                                            <button className="flex items-center gap-1 hover:text-primary transition-colors">Report</button>
                                        </div>
                                    </div>
                                ))}
                                {!showAllReviews && reviews.length > 3 && (
                                    <Button onClick={() => setShowAllReviews(true)} variant="secondary" className="w-full rounded-xl bg-surface border-theme text-foreground hover:bg-surface-elevated">Show all {reviews.length} reviews</Button>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="lg:col-span-4">
                        <div className="sticky top-28 bg-surface border border-theme rounded-[2.5rem] p-8 shadow-2xl space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground mb-1">From</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black">{displayCurrency} {displayPrice}</span>
                                        <span className="text-xs font-bold text-muted-foreground">per person</span>
                                    </div>
                                </div>
                                <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-[10px] font-black uppercase">Best Price</div>
                            </div>

                            <div className="space-y-4">
                                <RadixPopover open={showTravelersPopover} onOpenChange={setShowTravelersPopover}>
                                    <RadixPopoverTrigger asChild>
                                        <button className="w-full h-14 flex items-center justify-between px-5 bg-surface-elevated rounded-[1.25rem] border border-theme font-bold hover:border-primary/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <Users className="w-6 h-6 text-primary" />
                                                <div className="flex flex-col items-start translate-y-[-1px]">
                                                    <span className="text-[10px] uppercase opacity-60 leading-none mb-1">Travelers</span>
                                                    <span className="leading-none">
                                                        {travelers.adults + travelers.children + travelers.infants} Traveler{totalTravelers !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronDown className={cn("w-4 h-4 transition-transform opacity-40", showTravelersPopover && "rotate-180")} />
                                        </button>
                                    </RadixPopoverTrigger>
                                    <RadixPopoverPortal>
                                        <RadixPopoverContent className="w-[340px] p-6 bg-surface border border-theme rounded-3xl shadow-2xl z-[100] animate-in zoom-in-95 duration-200" align="end" sideOffset={12}>
                                            <div className="space-y-6">
                                                <div className="text-xs font-bold text-muted-foreground mb-4">Select up to 8 travelers in total.</div>

                                                {/* Adult */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-bold text-foreground">Adult (Age 18-99)</div>
                                                        <div className="text-[10px] text-muted-foreground">Minimum: 1, Maximum: 8</div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => setTravelers(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                                                            className="w-8 h-8 rounded-full border border-theme flex items-center justify-center disabled:opacity-20 hover:bg-surface-elevated transition-colors"
                                                            disabled={travelers.adults <= 1}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-bold w-4 text-center">{travelers.adults}</span>
                                                        <button
                                                            onClick={() => setTravelers(prev => ({ ...prev, adults: Math.min(8 - (travelers.children + travelers.infants), prev.adults + 1) }))}
                                                            className="w-8 h-8 rounded-full border border-theme flex items-center justify-center disabled:opacity-20 hover:bg-surface-elevated transition-colors"
                                                            disabled={totalTravelers >= 8}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Child */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-bold text-foreground">Child (Age 3-17)</div>
                                                            {getBandPrice('CHILD') === 0 && (
                                                                <span className="text-[10px] font-black text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">FREE*</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">Minimum: 0, Maximum: 7</div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => setTravelers(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                                                            className="w-8 h-8 rounded-full border border-theme flex items-center justify-center disabled:opacity-20 hover:bg-surface-elevated transition-colors"
                                                            disabled={travelers.children <= 0}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-bold w-4 text-center">{travelers.children}</span>
                                                        <button
                                                            onClick={() => setTravelers(prev => ({ ...prev, children: Math.min(7, prev.children + 1) }))}
                                                            className="w-8 h-8 rounded-full border border-theme flex items-center justify-center disabled:opacity-20 hover:bg-surface-elevated transition-colors"
                                                            disabled={totalTravelers >= 8}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Infant */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-bold text-foreground">Infant (Age 0-2)</div>
                                                            {getBandPrice('INFANT') === 0 && (
                                                                <span className="text-[10px] font-black text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">FREE*</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">Minimum: 0, Maximum: 7</div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => setTravelers(prev => ({ ...prev, infants: Math.max(0, prev.infants - 1) }))}
                                                            className="w-8 h-8 rounded-full border border-theme flex items-center justify-center disabled:opacity-20 hover:bg-surface-elevated transition-colors"
                                                            disabled={travelers.infants <= 0}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-bold w-4 text-center">{travelers.infants}</span>
                                                        <button
                                                            onClick={() => setTravelers(prev => ({ ...prev, infants: Math.min(7, prev.infants + 1) }))}
                                                            className="w-8 h-8 rounded-full border border-theme flex items-center justify-center disabled:opacity-20 hover:bg-surface-elevated transition-colors"
                                                            disabled={totalTravelers >= 8}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => setShowTravelersPopover(false)}
                                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                                                >
                                                    Apply
                                                </Button>

                                                <p className="text-[9px] text-muted-foreground text-center">
                                                    Price varies by group size. *Maximum discount rates shown may vary by date.
                                                </p>
                                            </div>
                                        </RadixPopoverContent>
                                    </RadixPopoverPortal>
                                </RadixPopover>

                                <RadixPopover open={showCalendarPopover} onOpenChange={setShowCalendarPopover}>
                                    <RadixPopoverTrigger asChild>
                                        <button className="w-full h-14 flex items-center justify-between px-5 bg-surface-elevated rounded-[1.25rem] border border-theme font-bold hover:border-primary/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <CalendarIcon className="w-6 h-6 text-primary" />
                                                <div className="flex flex-col items-start translate-y-[-1px]">
                                                    <span className="text-[10px] uppercase opacity-60 leading-none mb-1">Date</span>
                                                    <span className="leading-none">{selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select date'}</span>
                                                </div>
                                            </div>
                                            <ChevronDown className={cn("w-4 h-4 transition-transform opacity-40", showCalendarPopover && "rotate-180")} />
                                        </button>
                                    </RadixPopoverTrigger>
                                    <RadixPopoverPortal>
                                        <RadixPopoverContent className="p-4 bg-surface border border-theme rounded-3xl shadow-2xl z-[100]" align="end" sideOffset={12}>
                                            <DayPicker mode="single" selected={selectedDate} onSelect={(d) => { if (d) { setSelectedDate(d); setShowCalendarPopover(false); handleCheckAvailability(d); } }} disabled={(date) => date < startOfToday() || date > addDays(new Date(), 365)} />
                                        </RadixPopoverContent>
                                    </RadixPopoverPortal>
                                </RadixPopover>

                                <Button onClick={() => handleCheckAvailability()} disabled={!selectedDate || checkLoading} className="w-full h-16 rounded-full font-black text-xl shadow-xl shadow-primary/30">
                                    {checkLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Check availability"}
                                </Button>

                                <div className="pt-6 border-t border-theme space-y-4">
                                    <div className="flex items-start gap-4">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                                        <div><p className="text-sm font-bold">Free cancellation</p><p className="text-xs text-muted-foreground">Up to 24 hours in advance for a full refund</p></div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                                        <div>
                                            <p className="text-sm font-bold">Reserve now & pay later</p>
                                            <p className="text-xs text-muted-foreground italic leading-tight">Keep your travel plans flexible — book your spot and pay nothing today. <button className="underline font-bold">Read more</button></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <div className="bg-surface border-t border-theme mt-20 py-20">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div><Zap className="w-12 h-12 text-primary mx-auto mb-4" /><h4 className="font-black text-xl mb-2">Instant Confirmation</h4><p className="text-muted-foreground text-sm">Tickets in your inbox in seconds.</p></div>
                    <div><ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" /><h4 className="font-black text-xl mb-2">Verified Quality</h4><p className="text-muted-foreground text-sm">Every partner is hand-checked.</p></div>
                    <div><Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" /><h4 className="font-black text-xl mb-2">24/7 Support</h4><p className="text-muted-foreground text-sm">We're here whenever you need us.</p></div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-surface/90 backdrop-blur-xl border-t border-theme p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">From</p>
                    <p className="text-xl font-black">{displayCurrency} {displayPrice}</p>
                </div>
                <Button onClick={() => document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-xl px-8 h-12 font-bold">Check Availability</Button>
            </div>
        </div>
    );
}
