"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TripBookingModal } from "./TripBookingModal";
import { type TripPlanResponse, type TripActivity, replaceActivityAction, searchRestaurantsAction } from "@/app/actions/ai-planner";
import { SegmentCard, type SegmentData, type FoodOption } from "./SegmentCard";
import { useTrips, type TripItem } from "@/lib/trips/trips-context";
import { useAuth } from "@/lib/auth/auth-context";
import { generateAffiliateLink } from "@/lib/api/viator-affiliate";
import { format, startOfToday, isBefore, addDays } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { de, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface AIPlannerResultsProps {
    plan: TripPlanResponse;
    tripId?: string; // If saved, we have DB IDs
    savedItems?: TripItem[]; // DB items with status
    onSaveTrip?: () => void;
    query?: string;
    onPlanUpdate?: (newPlan: TripPlanResponse) => void; // Callback when plan is modified
}

export function AIPlannerResults({ plan, tripId, savedItems, onSaveTrip, query, onPlanUpdate }: AIPlannerResultsProps) {
    const t = useTranslations('aiPlan');
    const router = useRouter();
    const { user } = useAuth();
    const { saveTrip, updateItemStatus } = useTrips();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(!!tripId);
    const [currentPlan, setCurrentPlan] = useState(plan);
    const [replacingActivityId, setReplacingActivityId] = useState<string | null>(null);
    const [segments, setSegments] = useState<Record<string, SegmentData>>(plan.segments || {});

    if (!currentPlan || !currentPlan.itinerary || currentPlan.itinerary.length === 0) return null;

    const handleSaveTrip = async () => {
        if (!user) {
            // Could trigger auth modal here
            alert(t('loginToSave'));
            return;
        }
        setIsSaving(true);
        try {
            const saved = await saveTrip(currentPlan, query || "", segments);
            if (saved) {
                setIsSaved(true);
                onSaveTrip?.();
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Replace a single activity with an alternative
    const handleReplaceActivity = async (activityToReplace: TripActivity) => {
        setReplacingActivityId(activityToReplace.activityId);

        try {
            // Get all current product codes to avoid duplicates
            const existingCodes = currentPlan.itinerary.map(a => a.productCode);

            // Call the server action
            const replacement = await replaceActivityAction(
                currentPlan.destination,
                activityToReplace.productCode,
                activityToReplace.day,
                activityToReplace.timeOfDay,
                existingCodes
            );

            if (replacement) {
                // Update the plan with the new activity
                const newItinerary = currentPlan.itinerary.map(activity =>
                    activity.activityId === activityToReplace.activityId
                        ? replacement
                        : activity
                );

                const newPlan = { ...currentPlan, itinerary: newItinerary };
                setCurrentPlan(newPlan);
                onPlanUpdate?.(newPlan);
            } else {
                alert(t('noAlternatives') || 'No alternatives available');
            }
        } catch (error) {
            console.error("Failed to replace activity:", error);
            alert(t('replaceError') || 'Failed to find alternative');
        } finally {
            setReplacingActivityId(null);
        }
    };

    // Regenerate the entire plan
    const handleRegeneratePlan = () => {
        // Navigate back to home with the same query to regenerate
        if (query) {
            router.push(`/?regenerate=true&q=${encodeURIComponent(query)}`);
        } else {
            router.push('/');
        }
    };

    // Helper to get status from savedItems
    const getItemStatus = (activityId: string): 'proposed' | 'pending' | 'booked' => {
        if (!savedItems) return 'proposed';
        const item = savedItems.find(i => i.activity_id === activityId);
        return item?.status || 'proposed';
    };

    const getItemDbId = (activityId: string): string | undefined => {
        if (!savedItems) return undefined;
        return savedItems.find(i => i.activity_id === activityId)?.id;
    };

    const handleSearchRestaurants = async () => {
        try {
            return await searchRestaurantsAction(currentPlan.destination, 5, currentPlan.destinationId);
        } catch (error) {
            console.error("Error searching restaurants:", error);
            return [];
        }
    };

    const handleSegmentChange = (segmentId: string, data: SegmentData) => {
        setSegments(prev => ({
            ...prev,
            [segmentId]: data
        }));
    };

    return (
        <div id="ai-planner-results" className="animate-fade-in-up mt-12 mb-24 max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-bold mb-4 border border-primary/20">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    {t('badge')}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {t.rich('headerTitle', {
                        destination: currentPlan.destination,
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto italic mb-6">
                    "{currentPlan.summary}"
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {/* Save Trip Button */}
                    {!isSaved && (
                        <button
                            onClick={handleSaveTrip}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-full hover:from-primary/90 hover:to-cyan-500/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                    {t('saving')}
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">bookmark_add</span>
                                    {t('saveButton')}
                                </>
                            )}
                        </button>
                    )}
                    {isSaved && (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 font-bold rounded-full border border-green-500/30">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {t('saved')}
                        </div>
                    )}

                    {/* Regenerate Plan Button */}
                    <button
                        onClick={handleRegeneratePlan}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/20"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        {t('regeneratePlan') || 'Plan neu generieren'}
                    </button>
                </div>
            </div>

            <div className="space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-cyan-500 to-transparent opacity-30 md:-translate-x-1/2"></div>

                {/* Group items by Day */}
                {Array.from(new Set(currentPlan.itinerary.map(i => i.day))).sort().map((day) => {
                    const dayActivities = currentPlan.itinerary.filter(i => i.day === day);
                    return (
                        <div key={day} className="relative z-10">
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-primary/20">
                                    {t('day', { number: day })}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {dayActivities.map((activity, idx) => {
                                    const nextActivity = dayActivities[idx + 1];
                                    const segmentId = nextActivity ? `${activity.activityId}-${nextActivity.activityId}` : null;

                                    // Use state or default
                                    const segmentData = segmentId ? (segments[segmentId] || {
                                        fromActivityId: activity.activityId,
                                        toActivityId: nextActivity.activityId,
                                        transport: "walking",
                                        pauseMinutes: 30,
                                        includeFood: false
                                    }) : null;

                                    return (
                                        <React.Fragment key={activity.activityId}>
                                            <TripActivityCard
                                                activity={activity}
                                                index={idx}
                                                tripId={tripId}
                                                itemDbId={getItemDbId(activity.activityId)}
                                                status={getItemStatus(activity.activityId)}
                                                onStatusChange={updateItemStatus}
                                                isSaved={isSaved}
                                                t={t}
                                                onReplace={() => handleReplaceActivity(activity)}
                                                isReplacing={replacingActivityId === activity.activityId}
                                                startDate={currentPlan.startDate}
                                                travelerCount={currentPlan.travelerCount}
                                            />

                                            {segmentId && segmentData && (
                                                <SegmentCard
                                                    fromActivity={`${activity.title}, ${activity.location || ""}`}
                                                    toActivity={`${nextActivity.title}, ${nextActivity.location || ""}`}
                                                    segment={segmentData}
                                                    onSegmentChange={(data) => handleSegmentChange(segmentId, data)}
                                                    onSearchRestaurants={handleSearchRestaurants}
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface TripActivityCardProps {
    activity: TripActivity;
    index: number;
    tripId?: string;
    itemDbId?: string;
    status: 'proposed' | 'pending' | 'booked';
    onStatusChange: (tripId: string, itemId: string, status: 'proposed' | 'pending' | 'booked') => Promise<void>;
    isSaved: boolean;
    t: any;
    onReplace: () => void;
    isReplacing: boolean;
    startDate?: string | null;
    travelerCount?: number | null;
}

function TripActivityCard({ activity, index, tripId, itemDbId, status, onStatusChange, isSaved, t, onReplace, isReplacing, startDate, travelerCount }: TripActivityCardProps) {
    const isLeft = index % 2 === 0;
    const [localStatus, setLocalStatus] = useState(status);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Date selection state
    const [showDateModal, setShowDateModal] = useState(false);
    const [userSelectedDate, setUserSelectedDate] = useState<Date | undefined>(undefined);
    const locale = useLocale();

    // Calculate effective date for this activity
    const effectiveDate = React.useMemo(() => {
        if (userSelectedDate) return userSelectedDate;

        if (startDate && activity.day) {
            try {
                const d = new Date(startDate);
                if (!isNaN(d.getTime())) {
                    const today = startOfToday();
                    const newDate = addDays(d, activity.day - 1);

                    // If the calculated date is in the past, don't use it as effective date
                    if (isBefore(newDate, today)) {
                        return undefined;
                    }
                    return newDate;
                }
            } catch (e) {
                return undefined;
            }
        }
        return undefined;
    }, [startDate, activity.day, userSelectedDate]);

    // Generate booking URL - API returns full URLs with affiliate tracking already applied
    // For full URLs (from API), we just add our internal tracking (uid)
    // For relative URLs (fallback), we construct the full affiliate link
    const bookingUrl = (() => {
        let url = activity.productUrl;
        const separator = url.includes('?') ? '&' : '?';
        const uid = tripId && itemDbId ? `${tripId}_${itemDbId}` : undefined;

        let finalUrl = url;

        // Verify if it's already a full Viator URL (API) or needs construction
        if (!url.startsWith('https://www.viator.com')) {
            finalUrl = generateAffiliateLink(
                `https://www.viator.com${url.startsWith('/') ? url : '/' + url}`,
                tripId && itemDbId ? `${tripId}_${itemDbId}` : undefined
            );
        } else if (uid) {
            // Add internal tracking to existing full URL
            finalUrl = `${url}${separator}uid=${uid}`;
        }

        // --- NEW: Add Date and Travelers parameters ---
        const params: string[] = [];

        // Add Date from effectiveDate
        if (effectiveDate) {
            const dateStr = effectiveDate.toISOString().split('T')[0];
            params.push(`date=${dateStr}`);
        }

        // Add Travelers (Viator typically uses 'pax' or nothing for product pages, but we add it for deep linking context)
        // Some Viator pages respect 'availableTime' and 'pax'. Trying standard params.
        if (travelerCount) {
            // Often works as context
            params.push(`pax=${travelerCount}`);
        }

        if (params.length > 0) {
            const finalSeparator = finalUrl.includes('?') ? '&' : '?';
            finalUrl = `${finalUrl}${finalSeparator}${params.join('&')}`;
        }

        return finalUrl;
    })();

    const handleBookClick = () => {
        // Check if we have a date
        if (!effectiveDate) {
            setShowDateModal(true);
            return;
        }

        executeBooking();
    };

    const executeBooking = () => {
        // Update status to pending
        if (tripId && itemDbId && localStatus === 'proposed') {
            setLocalStatus('pending');
            onStatusChange(tripId, itemDbId, 'pending');
        }
        // Open Viator in new tab
        window.open(bookingUrl, '_blank', 'noopener,noreferrer');
        // Show confirmation modal after short delay
        setTimeout(() => setShowConfirmModal(true), 1000);
    };

    const handleConfirmBooking = () => {
        if (tripId && itemDbId) {
            setLocalStatus('booked');
            onStatusChange(tripId, itemDbId, 'booked');
        }
        setShowConfirmModal(false);
    };

    const statusColors = {
        proposed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        booked: 'bg-green-500/20 text-green-400 border-green-500/30'
    };

    const statusIcons = {
        proposed: 'schedule',
        pending: 'hourglass_top',
        booked: 'check_circle'
    };

    const statusLabels = {
        proposed: t('proposed'),
        pending: t('pending'),
        booked: t('booked')
    };

    return (
        <>
            <div className={`flex flex-col md:flex-row items-center gap-6 md:gap-0 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                {/* Content Side */}
                <div className={`w-full md:w-1/2 px-4 md:px-12 ${isLeft ? 'md:text-left' : 'md:text-right'}`}>
                    {/* Time of Day Badge */}
                    <div className={`inline-flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${activity.timeOfDay === 'morning' ? 'text-yellow-400' :
                        activity.timeOfDay === 'afternoon' ? 'text-orange-400' : 'text-indigo-400'
                        }`}>
                        <span className="material-symbols-outlined text-base">
                            {activity.timeOfDay === 'morning' ? 'wb_sunny' :
                                activity.timeOfDay === 'afternoon' ? 'light_mode' : 'dark_mode'}
                        </span>
                        {t(activity.timeOfDay)}
                    </div>

                    {/* Status Badge */}
                    {isSaved && (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ml-2 border ${statusColors[localStatus]}`}>
                            <span className="material-symbols-outlined text-xs">{statusIcons[localStatus]}</span>
                            {statusLabels[localStatus]}
                        </div>
                    )}

                    <h4 className="text-xl font-bold text-foreground mb-2 mt-2">{activity.title}</h4>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {activity.description}
                    </p>

                    <div className={`flex items-center gap-4 flex-wrap ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
                        <span className="text-foreground font-bold text-lg">{activity.currency}{activity.price}</span>

                        <Link href={activity.productUrl} className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1 group">
                            {t('details')}
                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>

                        {/* Book Button */}
                        {localStatus !== 'booked' ? (
                            <button
                                onClick={handleBookClick}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-cyan-500 text-white text-sm font-bold rounded-full hover:from-primary/90 hover:to-cyan-500/90 transition-all shadow-md"
                            >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                {t('bookOnViator')}
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 text-sm font-bold rounded-full border border-green-500/30">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {t('booked')}
                            </div>
                        )}
                    </div>

                    {/* Replace Activity Button - Only show if not booked */}
                    {localStatus !== 'booked' && (
                        <div className={`mt-4 ${isLeft ? 'md:text-left' : 'md:text-right'}`}>
                            <button
                                onClick={onReplace}
                                disabled={isReplacing}
                                className="inline-flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isReplacing ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                        {t('findingAlternative') || 'Alternative suchen...'}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                        {t('notSuitable') || 'Nicht passend? Alternative'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Timeline Dot */}
                <div className={`absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-4 border-background shadow-[0_0_10px_rgba(43,140,238,0.5)] md:-translate-x-1/2 ${localStatus === 'booked' ? 'bg-green-500' :
                    localStatus === 'pending' ? 'bg-yellow-500' : 'bg-primary'
                    }`}></div>

                {/* Image Side */}
                <div className="w-full md:w-1/2 px-4 md:px-12 pl-12 md:pl-12">
                    <Link href={activity.productUrl} className="block relative aspect-[16/9] rounded-2xl overflow-hidden group border border-white/10">
                        <Image
                            src={activity.image}
                            alt={activity.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>

                        {/* Status Overlay for booked items */}
                        {localStatus === 'booked' && (
                            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                                <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    {t('booked')}
                                </div>
                            </div>
                        )}
                    </Link>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-theme rounded-3xl p-8 max-w-md w-full animate-fade-in-up">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">help</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">{t('confirmTitle')}</h3>
                            <p className="text-muted-foreground mb-6">
                                {t('confirmText', { title: activity.title })}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleConfirmBooking}
                                    className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    {t('yesBooked')}
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    {t('notYet')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Wizard Modal */}
            <TripBookingModal
                isOpen={showDateModal}
                onClose={() => setShowDateModal(false)}
                activity={activity}
                initialDate={effectiveDate}
                travelerCount={travelerCount || 2}
                tripId={tripId}
                itemDbId={itemDbId}
                onBooked={() => {
                    if (tripId && itemDbId && localStatus === 'proposed') {
                        setLocalStatus('pending');
                        onStatusChange(tripId, itemDbId, 'pending');
                    }
                    setTimeout(() => setShowConfirmModal(true), 1000);
                }}
            />
        </>
    );
}
