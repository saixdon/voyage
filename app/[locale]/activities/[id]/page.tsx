"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { notFound, useRouter } from "next/navigation";
import type { TransformedActivity } from "@/lib/api/viator-client";
import { checkAvailabilityAction, type AvailabilityResult, type SimilarProduct } from "@/app/actions/viator";
import { format } from "date-fns";
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
    User
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
}

// Interface for Viator review from API
interface ViatorReview {
    reviewReference?: string;
    rating?: number;
    text?: string;
    title?: string;
    publishedDate?: string;
    travelerType?: string;
    userName?: string;
    ownerProviderPhotoId?: string;
    photos?: { photoUrl: string; caption?: string }[];
}

interface ReviewStats {
    reviewCountTotals?: { rating: number; count: number }[];
    totalReviews?: number;
    combinedAverageRating?: number;
}

interface ActivityWithBadge extends TransformedActivity {
    badge?: string;
    lat?: number;
    lng?: number;
    productOptions?: ProductOption[];
    userReviews?: any[];
    reviewsStats?: ReviewStats;
}

// Transformed review for UI
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

    // Data State
    const [activity, setActivity] = useState<ActivityWithBadge | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Booking State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedOptionCode, setSelectedOptionCode] = useState<string | null>(null);
    const [guestCount, setGuestCount] = useState(2);
    const [checkLoading, setCheckLoading] = useState(false);
    const [availability, setAvailability] = useState<AvailabilityResult | null>(null);

    // UI State
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Set default option when activity loads
    useEffect(() => {
        if (activity?.productOptions && activity.productOptions.length > 0) {
            setSelectedOptionCode(activity.productOptions[0].productOptionCode);
        }
    }, [activity]);

    // Favorites Logic
    const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
    const isFavorite = activity ? checkIsFavorite(activity.id) : false;

    // Reviews State
    const [reviews, setReviews] = useState<DisplayReview[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Fetch Activity Details
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

    // Load reviews directly from activity data
    useEffect(() => {
        if (activity?.userReviews && activity.userReviews.length > 0) {
            const transformedReviews: DisplayReview[] = activity.userReviews.map((r: any, idx: number) => ({
                id: r.reviewReference || `review-${idx}`,
                author: r.userName || "Verified Traveler",
                rating: r.rating || 5,
                date: r.publishedDate || new Date().toISOString(),
                comment: r.text || r.title || "No textual review provided.",
                avatar: undefined,
                // Try to extract photos from different structures Viator might return
                photos: r.photos?.map((p: any) => p.url) ||
                    r.photosInfo?.flatMap((pi: any) => pi.photoVersions?.map((pv: any) => pv.url)) ||
                    []
            }));
            setReviews(transformedReviews);
        } else {
            setReviews([]);
        }
    }, [activity]);

    // Auto-Check Availability when Date, Guests or Option change
    useEffect(() => {
        if (selectedDate && activity) {
            handleCheckAvailability();
        }
    }, [selectedDate, guestCount, activity?.productCode, selectedOptionCode]);

    const handleCheckAvailability = async () => {
        if (!selectedDate || !activity) return;

        setCheckLoading(true);
        setAvailability(null);

        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        try {
            // Pass destination for similar products when not available, and SELECTED OPTION CODE
            const result = await checkAvailabilityAction(activity.productCode, dateStr, activity.location, selectedOptionCode || undefined);
            setAvailability(result);
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
            pax: guestCount.toString(),
            price: price.toString(),
            currency: currency,
            optionCode: productOptionCode || 'DEFAULT'
        });

        router.push(`/checkout?${checkoutParams.toString()}`);
    };

    const allImages = activity ? [activity.image, ...(activity.images || [])] : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !activity) {
        notFound();
        return null;
    }

    const displayPrice = availability?.price ? availability.price.amount : activity.price;
    const displayCurrency = availability?.price ? availability.price.currency : activity.currency;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            {/* Gallery Overlay */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-xl">
                    <button onClick={() => setIsGalleryOpen(false)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 group">
                        <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                    </button>

                    <div className="absolute top-6 left-6 text-white/60 font-medium">
                        {currentImageIndex + 1} / {allImages.length}
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p - 1 + allImages.length) % allImages.length) }}
                        className="absolute left-6 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-50 hidden md:block"
                    >
                        <ChevronLeft className="w-10 h-10" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p + 1) % allImages.length) }}
                        className="absolute right-6 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-50 hidden md:block"
                    >
                        <ChevronRight className="w-10 h-10" />
                    </button>

                    <div className="relative w-full h-[80vh] flex items-center justify-center px-4">
                        <div className="relative w-full max-w-6xl h-full rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src={allImages[currentImageIndex]}
                                alt={`Gallery ${currentImageIndex}`}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Header Mini (Shows on scroll - potentially implemented at layout level) */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 1. Header Section */}
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                        <span className="hover:text-primary cursor-pointer transition-colors">Activities</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="hover:text-primary cursor-pointer transition-colors">{activity.location}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground/40">{activity.badge || "Experience"}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1] mb-6">
                                {activity.title}
                            </h1>

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

                                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {activity.location}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => toggleFavorite({
                                    activity_id: activity.id,
                                    activity_title: activity.title,
                                    activity_image: activity.image,
                                    activity_location: activity.location,
                                    activity_price: activity.price,
                                    activity_currency: activity.currency,
                                    activity_rating: activity.rating,
                                    activity_review_count: activity.reviewCount,
                                    activity_duration: activity.duration
                                })}
                                className={cn(
                                    "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full border transition-all font-bold",
                                    isFavorite ? "bg-red-50 border-red-100 text-red-500" : "bg-surface border-theme hover:bg-surface-elevated"
                                )}
                            >
                                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
                                <span>{isFavorite ? "Saved" : "Save"}</span>
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-surface border border-theme hover:bg-surface-elevated transition-all font-bold">
                                <Share2 className="w-5 h-5" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Photo Grid - Premium Layout */}
                <div
                    className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[450px] md:h-[600px] mb-12 rounded-[2rem] overflow-hidden cursor-pointer group"
                    onClick={() => setIsGalleryOpen(true)}
                >
                    <div className="md:col-span-2 md:row-span-2 relative h-full overflow-hidden">
                        <Image
                            src={activity.image}
                            alt={activity.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                    </div>

                    {allImages.slice(1, 5).map((img, i) => (
                        <div key={i} className="hidden md:block relative h-full overflow-hidden">
                            <Image
                                src={img}
                                alt={`Detail ${i + 1}`}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                            {i === 3 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] hover:backdrop-blur-0 transition-all">
                                    <div className="flex items-center gap-2 text-white font-extrabold px-6 py-3 rounded-full border-2 border-white/30 bg-white/10">
                                        <ImageIcon className="w-5 h-5" />
                                        <span>Show all photos</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Mobile Only: See All Photos Button */}
                    <div className="md:hidden absolute bottom-4 right-4 z-10">
                        <div className="flex items-center gap-2 text-white font-bold px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md">
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-sm">1 / {allImages.length}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Left Side: Details */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* Quick Info Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-[2rem] bg-surface border border-theme">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Clock className="w-5 h-5" />
                                    <span className="text-sm uppercase tracking-wider">Duration</span>
                                </div>
                                <p className="font-extrabold text-foreground">{activity.duration}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-sm uppercase tracking-wider">Cancellation</span>
                                </div>
                                <p className="font-extrabold text-foreground">Free (24h)</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Ticket className="w-5 h-5" />
                                    <span className="text-sm uppercase tracking-wider">Mobile</span>
                                </div>
                                <p className="font-extrabold text-foreground">Instant Ticket</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Globe className="w-5 h-5" />
                                    <span className="text-sm uppercase tracking-wider">Languages</span>
                                </div>
                                <p className="font-extrabold text-foreground">EN, DE, FR</p>
                            </div>
                        </div>

                        {/* Experience Highlights */}
                        <section>
                            <h3 className="text-2xl md:text-3xl font-black mb-8 text-foreground flex items-center gap-3">
                                <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
                                Experience Highlights
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Bypassing the long entrance lines with our priority tickets",
                                    "Learn fascinating historical facts from a certified local expert",
                                    "Limited group size for a more intimate and personal experience",
                                    "Access to exclusive areas not open to the general public"
                                ].map((item, i) => (
                                    <div key={i} className="group flex items-start gap-4 p-5 rounded-2xl bg-surface/50 border border-transparent hover:border-primary/20 hover:bg-surface transition-all">
                                        <div className="mt-1 bg-primary text-white p-1.5 rounded-full">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <span className="text-foreground/80 font-medium leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Full Description */}
                        <section>
                            <h3 className="text-2xl md:text-3xl font-black mb-8 text-foreground">Full Description</h3>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground/90 leading-relaxed font-medium">
                                <p className="mb-6 first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                                    Prepare for an extraordinary journey as you explore the most iconic landmarks of {activity.location}.
                                    This meticulously curated experience is designed to immerse you in the rich tapestry of local life,
                                    combining historical depth with modern comfort and style.
                                </p>
                                <p className="mb-4">
                                    Your professional guide will meeting you at the designated starting point, ready to share insider
                                    stories and hidden details that you won't find in any guidebook. We pride ourselves on offering
                                    more than just a tour; it's a deep dive into the heart and soul of the city.
                                </p>
                                <div className="p-6 my-8 rounded-2xl bg-primary/5 border-l-4 border-primary italic text-foreground/80">
                                    "Every corner reveals a new story. Our goal is to make sure you return home with more than just photos, but with a true connection to our culture."
                                </div>
                                <p>
                                    As we move through the itinerary, we'll take time for questions and breaks at carefully chosen
                                    spots that offer the best photo opportunities away from the heavy crowds. This experience is
                                    fully optimized for comfort, ensuring you can focus entirely on the wonders unfolding before you.
                                </p>
                            </div>
                        </section>

                        {/* Location Details */}
                        <section className="scroll-mt-24" id="location">
                            <h3 className="text-2xl md:text-3xl font-black mb-8 text-foreground flex items-center gap-3">
                                <Navigation className="w-8 h-8 text-blue-500" />
                                Meeting Point & Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-surface border border-theme">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <h4 className="font-black text-foreground">Exact Address</h4>
                                        </div>
                                        <p className="text-muted-foreground font-medium mb-4">
                                            {activity.location}, Central Square Plaza, Area 5.<br />
                                            Look for the guide holding a blue TripVega flag.
                                        </p>
                                        <Button variant="secondary" className="w-full rounded-xl font-bold gap-2">
                                            <Navigation className="w-4 h-4" />
                                            Get Directions
                                        </Button>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-surface/50 border border-theme flex gap-4">
                                        <Info className="w-6 h-6 text-primary shrink-0" />
                                        <p className="text-sm text-muted-foreground font-medium">
                                            Please arrive at least 15 minutes before the start time to ensure a smooth check-in process.
                                        </p>
                                    </div>
                                </div>
                                <ActivityMap
                                    location={activity.location}
                                    lat={activity.lat}
                                    lng={activity.lng}
                                    className="h-full min-h-[300px]"
                                />
                            </div>
                        </section>

                        {/* Customer Reviews Section */}
                        <section className="scroll-mt-24" id="reviews">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 pb-12 border-b border-theme/50">
                                {/* Left: Overall & Recent Stats */}
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3 mb-8">
                                        <MessageCircle className="w-8 h-8 text-primary" />
                                        Customer Opinions
                                    </h3>

                                    <div className="flex items-start gap-12">
                                        {/* Total Score */}
                                        <div>
                                            <div className="text-6xl font-black text-foreground mb-2 tracking-tight">
                                                {activity.rating ? activity.rating.toFixed(1) : "New"}
                                            </div>
                                            <div className="flex text-yellow-500 mb-3 gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={cn("w-5 h-5", i < Math.floor(activity.rating || 0) ? "fill-current" : "text-input")} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground font-bold">
                                                Based on {activity.reviewCount} verified reviews
                                            </p>
                                        </div>

                                        {/* Recent Score (Last 10) */}
                                        {reviews.length > 0 && (
                                            <div className="hidden md:block pl-12 border-l border-theme/50">
                                                <div className="text-6xl font-black text-foreground mb-2 tracking-tight">
                                                    {(reviews.slice(0, 10).reduce((a, b) => a + b.rating, 0) / Math.min(reviews.length, 10)).toFixed(1)}
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-400 font-extrabold uppercase tracking-widest mb-3">
                                                    Recent Rating
                                                </div>
                                                <p className="text-sm text-muted-foreground font-medium">
                                                    Avg. of last {Math.min(reviews.length, 10)} reviews
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Rating Histogram */}
                                <div className="flex flex-col justify-center space-y-3 pt-4">
                                    {[5, 4, 3, 2, 1].map(stars => {
                                        // Get count from stats or fallback to approximate if we only have total
                                        const stat = activity.reviewsStats?.reviewCountTotals?.find(r => r.rating === stars);
                                        const count = stat ? stat.count : (stars === 5 ? (activity.reviewCount || 0) : 0); // Fallback: Assume mostly 5 stars if no stats
                                        const total = activity.reviewsStats?.totalReviews || activity.reviewCount || 1;
                                        const percent = Math.min(100, Math.max(0, (count / total) * 100));

                                        return (
                                            <div key={stars} className="flex items-center gap-4 text-sm group cursor-default">
                                                <div className="flex items-center gap-1 w-8 shrink-0">
                                                    <span className="font-bold text-foreground">{stars}</span>
                                                    <Star className="w-3 h-3 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 h-3 bg-surface-elevated rounded-full overflow-hidden border border-transparent group-hover:border-primary/10 transition-colors">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="font-medium text-muted-foreground w-12 text-right tabular-nums">{count}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Reviews List */}
                            {reviewsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="space-y-8">
                                    {reviews.slice(0, showAllReviews ? undefined : 3).map((review) => (
                                        <div key={review.id} className="flex gap-4 md:gap-8 pb-8 border-b border-theme/50 last:border-0 last:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            {/* Avatar */}
                                            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-surface-elevated flex items-center justify-center shrink-0 border border-theme shadow-sm">
                                                <span className="text-lg font-black text-primary">
                                                    {review.author.charAt(0).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-foreground text-lg">{review.author}</h4>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                            {format(new Date(review.date), 'MMMM yyyy', { locale: locale === 'de' ? de : enUS })} • Verified Booking
                                                        </p>
                                                    </div>
                                                    <div className="flex text-yellow-500 gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-current" : "text-input")} />
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className="text-foreground/90 leading-relaxed font-medium">
                                                    "{review.comment}"
                                                </p>

                                                {review.photos && review.photos.length > 0 && (
                                                    <div className="flex gap-3 pt-2 overflow-x-auto pb-2">
                                                        {review.photos.map((photo, idx) => (
                                                            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-theme cursor-pointer hover:opacity-90 transition-opacity">
                                                                <Image src={photo} alt="Review photo" fill className="object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 pt-2">
                                                    <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                                        👍 Helpful
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Show More Button */}
                                    {!showAllReviews && reviews.length > 3 && (
                                        <div className="pt-8 text-center">
                                            <Button
                                                onClick={() => setShowAllReviews(true)}
                                                variant="ghost"
                                                className="rounded-full px-8 py-6 font-black text-foreground border-2 border-theme hover:bg-surface-elevated hover:border-primary/20 transition-all hover:scale-105"
                                            >
                                                Read all {reviews.length} reviews
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-6 rounded-3xl bg-surface-elevated/50 border border-dashed border-theme">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
                                    <h4 className="text-lg font-bold mb-2">No reviews yet</h4>
                                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                        Be the first to share your experience! Book this activity and let others know what you think.
                                    </p>
                                </div>
                            )}
                        </section>

                    </div>

                    {/* Right Side: Sticky Booking Widget */}
                    <aside className="lg:col-span-4 relative">
                        <div className="sticky top-28 bg-surface border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 ring-1 ring-black/5 overflow-hidden transition-all">

                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Best Price Guarantee</span>
                            </div>

                            <div className="mb-8">
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Price</p>
                                <div className="flex flex-col gap-1">
                                    {displayPrice && displayPrice > 0 ? (
                                        <>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-foreground">
                                                    {displayCurrency} {(displayPrice * guestCount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            {guestCount > 1 ? (
                                                <span className="text-sm text-muted-foreground font-bold">
                                                    {displayCurrency} {displayPrice} x {guestCount} {guestCount === 1 ? 'Person' : 'People'}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground font-bold">per person</span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-primary">Check availability</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">Price available after date selection</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 mb-8">
                                {/* Product Options Selector */}
                                {activity?.productOptions && activity.productOptions.length > 1 && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Option</label>
                                        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                                            {activity.productOptions.map((opt) => (
                                                <button
                                                    key={opt.productOptionCode}
                                                    onClick={() => setSelectedOptionCode(opt.productOptionCode)}
                                                    className={cn(
                                                        "w-full px-4 py-3 rounded-2xl border-2 text-left transition-all",
                                                        selectedOptionCode === opt.productOptionCode
                                                            ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                                                            : "bg-surface-elevated border-transparent hover:border-primary/30 text-foreground"
                                                    )}
                                                >
                                                    <div className="text-sm font-semibold">{opt.title}</div>
                                                    {opt.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{opt.description}</div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Date Selection */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Travel Date</label>
                                    <RadixPopover>
                                        <RadixPopoverTrigger asChild>
                                            <button className={cn(
                                                "w-full flex items-center justify-between px-6 py-4 bg-surface-elevated border-2 border-transparent hover:border-primary/30 rounded-2xl transition-all text-left group",
                                                !selectedDate && "text-muted-foreground",
                                                selectedDate && "text-foreground font-bold shadow-sm"
                                            )}>
                                                <div className="flex items-center gap-4">
                                                    <CalendarIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                                    <span>
                                                        {selectedDate
                                                            ? format(selectedDate, "dd. MMM yyyy", { locale: locale === 'de' ? de : enUS })
                                                            : "Select date"}
                                                    </span>
                                                </div>
                                                <ChevronDown className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                                            </button>
                                        </RadixPopoverTrigger>
                                        <RadixPopoverPortal>
                                            <RadixPopoverContent className="w-auto p-4 bg-surface border border-theme rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100] animate-in slide-in-from-top-2" align="end" sideOffset={12}>
                                                <DayPicker
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={setSelectedDate}
                                                    disabled={{ before: new Date() }}
                                                    className="p-2"
                                                    modifiersClassNames={{
                                                        selected: "bg-primary text-white font-bold rounded-xl",
                                                        today: "text-primary border-b-2 border-primary"
                                                    }}
                                                />
                                            </RadixPopoverContent>
                                        </RadixPopoverPortal>
                                    </RadixPopover>
                                </div>

                                {/* Participants */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Quantity</label>
                                    <div className="flex items-center justify-between px-6 py-4 bg-surface-elevated rounded-2xl border-2 border-transparent">
                                        <div className="flex items-center gap-4">
                                            <Users className="w-5 h-5 text-primary" />
                                            <span className="font-bold text-foreground">{guestCount} {guestCount === 1 ? 'Person' : 'People'}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                                className="w-10 h-10 flex items-center justify-center bg-surface border border-theme rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30"
                                                disabled={guestCount <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                                                className="w-10 h-10 flex items-center justify-center bg-surface border border-theme rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="space-y-4">
                                {!selectedDate ? (
                                    <div className="p-6 bg-primary/5 rounded-3xl border-2 border-primary/10 border-dashed text-center">
                                        <p className="text-sm font-bold text-primary">Choose a date to confirm prices</p>
                                    </div>
                                ) : checkLoading ? (
                                    <div className="py-6 flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <span className="text-xs font-black text-primary uppercase animate-pulse">Checking Availability...</span>
                                    </div>
                                ) : availability ? (
                                    <div className="space-y-4 animate-in fade-in duration-500">
                                        {availability.available ? (
                                            <>
                                                <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-sm">
                                                    <CheckCircle className="w-5 h-5 shrink-0" />
                                                    <span>Limited spots left! Booking highly recommended.</span>
                                                </div>

                                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                                    {availability.bookableItems?.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => handleBookOption(availability.affiliateUrl, item.productOptionCode)}
                                                            className="group p-5 bg-surface-elevated hover:bg-primary/5 border-2 border-transparent hover:border-primary/20 rounded-2xl transition-all cursor-pointer relative overflow-hidden"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h5 className="font-extrabold text-sm pr-12">{item.productOptionCode === 'DEFAULT' ? 'Standard Ticket' : item.productOptionCode}</h5>
                                                                <div className="text-right">
                                                                    <div className="text-foreground font-black">{item.price?.totalPrice?.price?.currency} {item.price?.totalPrice?.price?.value}</div>
                                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase">All Incl.</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-4">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                                    <Clock className="w-4 h-4 text-primary" />
                                                                    {item.startTime || 'Flexible Start'}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-primary font-black text-xs uppercase opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                                    Book <ChevronRight className="w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <Button
                                                    onClick={() => handleBookOption(availability.affiliateUrl)}
                                                    className="w-full h-16 rounded-[2rem] bg-primary text-white text-lg font-black shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    Confirm Booking
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Sold Out Header */}
                                                <div className="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl text-center">
                                                    <p className="font-black text-amber-700 dark:text-amber-400 text-lg mb-1">
                                                        This date is sold out
                                                    </p>
                                                    <p className="text-sm text-amber-600/80 dark:text-amber-500/80 font-medium">
                                                        for {guestCount} {guestCount === 1 ? 'person' : 'people'}
                                                    </p>
                                                </div>

                                                {/* Next Available Date */}
                                                {availability.nextAvailableDate && (
                                                    <div className="p-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl">
                                                        <p className="text-sm text-green-700 dark:text-green-400 font-bold mb-3">
                                                            Next available date:
                                                        </p>
                                                        <button
                                                            onClick={() => setSelectedDate(new Date(availability.nextAvailableDate!))}
                                                            className="w-full flex items-center justify-between p-4 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/50 rounded-xl transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <CalendarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                                <span className="font-black text-green-700 dark:text-green-300">
                                                                    {format(new Date(availability.nextAvailableDate), "dd. MMMM yyyy", { locale: locale === 'de' ? de : enUS })}
                                                                </span>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Similar Products */}
                                                {availability.similarProducts && availability.similarProducts.length > 0 && (
                                                    <div className="pt-4 border-t border-theme">
                                                        <p className="text-sm font-bold text-muted-foreground mb-4">
                                                            Similar experiences in {activity.location}:
                                                        </p>
                                                        <div className="space-y-3">
                                                            {availability.similarProducts.map((product) => (
                                                                <a
                                                                    key={product.productCode}
                                                                    href={`/${locale}/activities/${product.productCode}`}
                                                                    className="flex gap-3 p-3 bg-surface-elevated hover:bg-primary/5 rounded-xl transition-all group"
                                                                >
                                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                                                        <Image
                                                                            src={product.image}
                                                                            alt={product.title}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                                                            {product.title}
                                                                        </h5>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                                                                <Star className="w-3 h-3 fill-current" />
                                                                                <span className="font-bold">{product.rating.toFixed(1)}</span>
                                                                            </div>
                                                                            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                                                                            <span className="text-xs font-black text-primary ml-auto">
                                                                                from {product.currency} {product.price}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Go back button */}
                                                <button
                                                    onClick={() => setSelectedDate(undefined)}
                                                    className="w-full text-center text-sm font-bold text-primary hover:underline py-2"
                                                >
                                                    ← Anderes Datum wählen
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            {/* Trust & Policy */}
                            <div className="mt-8 pt-8 border-t border-theme-dark/10 space-y-4">
                                <div className="flex items-center gap-3 text-muted-foreground/60 transition-colors">
                                    <Smartphone className="w-5 h-5" />
                                    <span className="text-xs font-bold">Mobile tickets accepted</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground/60 transition-colors">
                                    <Users className="w-5 h-5" />
                                    <span className="text-xs font-bold">Small group (max 15)</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground/60 transition-colors">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-xs font-bold">Secure payment & checkout</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Recommendations / Why Us Section (Optional but premium) */}
            <div className="bg-surface border-t border-theme mt-20 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 px-4">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">You're in good hands.</h2>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                            Join millions of world travelers planning their dream trips with TripVega.
                            We carefully vet every activity for quality and safety.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                                <Zap className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Instant Confirmation</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">No waiting. Once you pay, your tickets land in your inbox immediately. Focus on the fun.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-500 mx-auto mb-6 group-hover:bg-green-500 group-hover:text-white transition-all duration-500 -rotate-3 group-hover:rotate-0">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Verified Quality</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">Every partner is checked by our team. If it's not excellent, it's not on TripVega.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 mx-auto mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 rotate-6 group-hover:rotate-0">
                                <Star className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Customer Support</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">Travel doesn't always go to plan. That's why we're here 24/7 to help you out.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
