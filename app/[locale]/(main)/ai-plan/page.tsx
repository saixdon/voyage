"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { generateTripPlanAction, type TripPlanResponse } from "@/app/actions/ai-planner";
import { AIPlannerResults } from "@/components/features/AIPlannerResults";
import { Sparkles, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

function AIPlanContent() {
    const searchParams = useSearchParams();
    const t = useTranslations('aiPlan');
    const commonT = useTranslations('common');

    const [plan, setPlan] = useState<TripPlanResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const query = searchParams.get("q") || "";
    const travelers = searchParams.get("travelers") || "couple";
    const budget = searchParams.get("budget") || "balanced";
    const pacing = searchParams.get("pacing") || "balanced";
    const mobility = searchParams.get("mobility") || "active";
    const vibe = searchParams.get("vibe")?.split(",") || [];
    const startDate = searchParams.get("from"); // YYYY-MM-DD (potentially ISO)
    const guests = searchParams.get("guests") ? parseInt(searchParams.get("guests")!) : undefined;

    useEffect(() => {
        async function generatePlan() {
            if (!query) {
                setError("No destination specified");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await generateTripPlanAction(query, {
                    travelers: travelers as any,
                    budget: budget as any,
                    pacing: pacing as any,
                    mobility: mobility as any,
                    vibe: vibe,
                    startDate: startDate || undefined,
                    guestCount: guests
                });

                if (result.error) {
                    setError(result.error);
                } else {
                    setPlan(result);
                }
            } catch (err) {
                console.error("Failed to generate plan:", err);
                setError("Failed to generate your trip plan. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        generatePlan();
    }, [query, travelers, budget, pacing, mobility, vibe.join(","), startDate, guests]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-b from-primary/20 to-transparent pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {commonT('close')}
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-full bg-primary/20">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                            {t('badge')}
                        </h1>
                    </div>

                    {query && (
                        <p className="text-xl text-muted-foreground">
                            {query}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" style={{ animationDuration: '1.5s' }}></div>
                        </div>
                        <h2 className="mt-8 text-xl font-bold text-foreground">
                            {t('saving').replace('...', '')}...
                        </h2>
                        <p className="mt-2 text-muted-foreground text-center max-w-md">
                            Wir erstellen deinen perfekten Reiseplan mit KI...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="p-4 rounded-full bg-red-500/20 mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            {commonT('error')}
                        </h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors"
                        >
                            {commonT('retry')}
                        </Link>
                    </div>
                ) : plan ? (
                    <AIPlannerResults plan={plan} query={query} onPlanUpdate={setPlan} />
                ) : null}
            </div>
        </div>
    );
}

export default function AIPlanPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <AIPlanContent />
        </Suspense>
    );
}
