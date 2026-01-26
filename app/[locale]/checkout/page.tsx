"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ViatorPaymentForm } from "@/components/checkout/ViatorPaymentForm";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Calendar,
    Users,
    Clock,
    Shield,
    CreditCard,
    Loader2,
    CheckCircle,
    AlertCircle,
    MapPin,
    Info,
    Navigation,
    User
} from "lucide-react";

interface BookerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

type CheckoutStep = "contact" | "activity" | "payment" | "processing" | "complete" | "error";

export default function CheckoutPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <CheckoutContent />
        </React.Suspense>
    );
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();

    // Extract params from URL
    const productCode = searchParams.get("productCode") || "";
    const productTitle = searchParams.get("title") || "Activity";
    const productImage = searchParams.get("image") || "";
    const dateStr = searchParams.get("date") || "";
    const timeStr = searchParams.get("time") || "";
    const pax = parseInt(searchParams.get("pax") || "1", 10);
    const adults = parseInt(searchParams.get("adults") || "2", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const youth = parseInt(searchParams.get("youth") || "0", 10);
    const infants = parseInt(searchParams.get("infants") || "0", 10);
    const price = parseFloat(searchParams.get("price") || "0");
    const currency = searchParams.get("currency") || "EUR";
    const productOptionCode = searchParams.get("optionCode") || "DEFAULT";

    // State
    const [step, setStep] = useState<CheckoutStep>("contact");
    const [bookerInfo, setBookerInfo] = useState<BookerInfo>({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    });
    // Extra Travelers Names (Step 2)
    const [travelerNames, setTravelerNames] = useState<{ firstName: string; lastName: string }[]>([{ firstName: "", lastName: "" }]);

    const [emailConfirm, setEmailConfirm] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [cartRef, setCartRef] = useState<string | null>(null);
    const [paymentSessionToken, setPaymentSessionToken] = useState<string | null>(null);
    const [bookingRef, setBookingRef] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHolding, setIsHolding] = useState(false);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(1199); // 19:59 in seconds

    // Timer Effect
    useEffect(() => {
        if (step === "complete" || step === "error") return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step]);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Validate required params
    useEffect(() => {
        if (!productCode || !dateStr) {
            setError("Fehlende Buchungsparameter. Bitte zurück zur Aktivität.");
        }
    }, [productCode, dateStr]);

    // Initialize traveler names based on pax count
    useEffect(() => {
        if (pax > 1) {
            setTravelerNames(Array(pax).fill({ firstName: "", lastName: "" }));
        }
    }, [pax]);

    // Step 1 -> Step 2
    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors([]);

        if (bookerInfo.email !== emailConfirm) {
            setFormErrors(["E-Mail-Adressen stimmen nicht überein"]);
            return;
        }

        setStep("activity");
        window.scrollTo(0, 0);
    };

    // Step 2 -> Step 3 (Hold)
    const handleActivitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors([]);

        setIsHolding(true);
        setError(null);

        try {
            const paxMix = [];
            if (adults > 0) paxMix.push({ ageBand: "ADULT", numberOfTravelers: adults });
            if (youth > 0) paxMix.push({ ageBand: "YOUTH", numberOfTravelers: youth });
            if (children > 0) paxMix.push({ ageBand: "CHILD", numberOfTravelers: children });
            if (infants > 0) paxMix.push({ ageBand: "INFANT", numberOfTravelers: infants });

            const holdResponse = await fetch("/api/bookings/hold", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [{
                        productCode,
                        productOptionCode,
                        travelDate: dateStr,
                        paxMix: paxMix.length > 0 ? paxMix : [{ ageBand: "ADULT", numberOfTravelers: pax }]
                    }],
                    currency,
                    specialRequests: specialRequests.trim() || undefined
                })
            });

            const holdData = await holdResponse.json();

            if (holdData.error) {
                setError(holdData.error);
                setStep("error");
                return;
            }

            setCartRef(holdData.cartRef);
            setPaymentSessionToken(holdData.paymentSessionToken || holdData.cartRef);
            setStep("payment");
            window.scrollTo(0, 0);
        } catch (err) {
            console.error("Hold error:", err);
            setError("Reservierung fehlgeschlagen. Bitte erneut versuchen.");
            setStep("error");
        } finally {
            setIsHolding(false);
        }
    };

    // Called when payment is successful - receives paymentToken from Viator iFrame
    const handlePaymentComplete = async (paymentToken?: string) => {
        if (!cartRef) return;
        setStep("processing");

        try {
            const bookResponse = await fetch("/api/bookings/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartRef,
                    paymentToken, // Token from Viator Payment iFrame
                    booker: {
                        email: bookerInfo.email,
                        firstName: bookerInfo.firstName,
                        lastName: bookerInfo.lastName,
                        phone: bookerInfo.phone
                    },
                    currency
                })
            });

            const bookData = await bookResponse.json();

            if (bookData.error) {
                setError(bookData.error);
                setStep("error");
                return;
            }

            setBookingRef(bookData.bookingRef || "DEMO-" + Date.now());
            setStep("complete");
        } catch (err) {
            console.error("Booking error:", err);
            setError("Buchung fehlgeschlagen. Bitte kontaktiere den Support.");
            setStep("error");
        }
    };

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), "dd. MMMM yyyy", { locale: locale === "de" ? de : enUS });
        } catch {
            return date;
        }
    };

    const totalPrice = price * pax;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header with Progress & Timer */}
            <div className="sticky top-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-theme">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href={`/activities/${productCode}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Zurück</span>
                    </Link>

                    {/* Steps Indicator */}
                    <div className="hidden md:flex items-center gap-6">
                        {["contact", "activity", "payment"].map((s, idx) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                                        step === s ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" :
                                            (["contact", "activity", "payment"].indexOf(step) > idx ? "bg-green-500 text-white" : "bg-theme text-muted-foreground")
                                    )}>
                                        {["contact", "activity", "payment"].indexOf(step) > idx ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        step === s ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {s === "contact" ? "Kontakt" : s === "activity" ? "Details" : "Zahlung"}
                                    </span>
                                </div>
                                {idx < 2 && <div className="w-6 h-[1px] bg-theme" />}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full text-amber-600 border border-amber-500/20">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold tabular-nums">{formatTimer(timeLeft)}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                    {/* Left: Sidebar (Sticky) */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="sticky top-32 space-y-6">
                            {/* Summary Card */}
                            <div className="bg-surface border border-theme rounded-3xl overflow-hidden shadow-sm">
                                {productImage && (
                                    <div className="relative aspect-[16/9]">
                                        <Image
                                            src={decodeURIComponent(productImage)}
                                            alt={productTitle}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                                Reserviert
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="p-6 space-y-6">
                                    <h2 className="text-lg font-black leading-tight text-foreground line-clamp-2">{decodeURIComponent(productTitle)}</h2>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-primary shrink-0" />
                                            <div>
                                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Datum & Zeit</p>
                                                <p className="text-sm font-bold text-foreground">{formatDate(dateStr)} {timeStr && `• ${timeStr}`}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Users className="w-5 h-5 text-primary shrink-0" />
                                            <div>
                                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Teilnehmer</p>
                                                <div className="text-sm font-bold text-foreground space-y-0.5">
                                                    {adults > 0 && <div>{adults} Erwachsene</div>}
                                                    {youth > 0 && <div>{youth} Jugendliche</div>}
                                                    {children > 0 && <div>{children} Kinder</div>}
                                                    {infants > 0 && <div>{infants} Kleinkinder</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-theme space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground font-medium">Zwischensumme</span>
                                            <span className="text-foreground font-bold">{currency} {(price * pax).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-theme border-dashed">
                                            <span className="text-lg font-black text-foreground uppercase tracking-tight">Gesamtpreis</span>
                                            <div className="text-right">
                                                <span className="text-3xl font-black text-primary">{currency} {(price * pax).toFixed(2)}</span>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">inkl. aller Steuern</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Protection Banner */}
                            <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-2xl flex gap-4">
                                <Shield className="w-6 h-6 text-green-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-green-700">Kostenlose Stornierung</p>
                                    <p className="text-xs text-green-600/80 font-medium">Bis zu 24 Stunden vor Beginn für eine volle Rückerstattung.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Main Checkout Flow */}
                    <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">

                        {/* Error Notification */}
                        {step === "error" && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-300">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                                <h2 className="text-2xl font-black text-foreground mb-3">Hoppla! Da ist was schiefgelaufen.</h2>
                                <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">{error}</p>
                                <Button onClick={() => setStep("contact")} size="lg" className="w-full sm:w-auto bg-primary text-white font-bold rounded-2xl">
                                    Erneut versuchen
                                </Button>
                            </div>
                        )}

                        {/* Step 1: Contact Details */}
                        {step === "contact" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">1</div>
                                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Kontaktdaten</h2>
                                </div>

                                <form onSubmit={handleContactSubmit} className="bg-surface border border-theme rounded-3xl p-8 space-y-6 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Vorname *</label>
                                            <input
                                                type="text"
                                                required
                                                value={bookerInfo.firstName}
                                                onChange={(e) => setBookerInfo({ ...bookerInfo, firstName: e.target.value })}
                                                className="w-full h-14 px-5 bg-surface-elevated border-2 border-transparent focus:border-primary/30 rounded-2xl transition-all outline-none font-bold placeholder:text-muted-foreground/40"
                                                placeholder="Max"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Nachname *</label>
                                            <input
                                                type="text"
                                                required
                                                value={bookerInfo.lastName}
                                                onChange={(e) => setBookerInfo({ ...bookerInfo, lastName: e.target.value })}
                                                className="w-full h-14 px-5 bg-surface-elevated border-2 border-transparent focus:border-primary/30 rounded-2xl transition-all outline-none font-bold placeholder:text-muted-foreground/40"
                                                placeholder="Mustermann"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">E-Mail *</label>
                                        <input
                                            type="email"
                                            required
                                            value={bookerInfo.email}
                                            onChange={(e) => setBookerInfo({ ...bookerInfo, email: e.target.value })}
                                            className="w-full h-14 px-5 bg-surface-elevated border-2 border-transparent focus:border-primary/30 rounded-2xl transition-all outline-none font-bold"
                                            placeholder="deinname@beispiel.de"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">E-Mail bestätigen *</label>
                                        <input
                                            type="email"
                                            required
                                            value={emailConfirm}
                                            onChange={(e) => setEmailConfirm(e.target.value)}
                                            className={cn(
                                                "w-full h-14 px-5 bg-surface-elevated border-2 rounded-2xl transition-all outline-none font-bold",
                                                emailConfirm && emailConfirm !== bookerInfo.email ? "border-red-500/50" : "border-transparent focus:border-primary/30"
                                            )}
                                            placeholder="E-Mail erneut eingeben"
                                        />
                                        {emailConfirm && emailConfirm !== bookerInfo.email && (
                                            <p className="text-red-500 text-xs font-bold mt-1 ml-1">E-Mail-Adressen stimmen nicht überein</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Telefon *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={bookerInfo.phone}
                                            onChange={(e) => setBookerInfo({ ...bookerInfo, phone: e.target.value })}
                                            className="w-full h-14 px-5 bg-surface-elevated border-2 border-transparent focus:border-primary/30 rounded-2xl transition-all outline-none font-bold"
                                            placeholder="+49 123 456789"
                                        />
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 ml-1">Wichtig für Last-Minute Updates vor Ort</p>
                                    </div>

                                    <Button type="submit" className="w-full h-16 rounded-[2rem] bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all mt-4">
                                        Weiter zu den Reisedetails
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Step 2: Activity Details */}
                        {step === "activity" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">2</div>
                                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Reisedetails</h2>
                                </div>

                                <form onSubmit={handleActivitySubmit} className="bg-surface border border-theme rounded-3xl p-8 space-y-8 shadow-sm">

                                    {/* Primary Traveler for each group */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-black text-foreground flex items-center gap-3">
                                            <Users className="w-5 h-5 text-primary" />
                                            Reisende Namen
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {travelerNames.map((t, i) => (
                                                <div key={i} className="p-4 bg-surface-elevated rounded-2xl border border-theme/50">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-3">Reisender {i + 1}</p>
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Vorname"
                                                            className="w-full h-10 px-4 bg-surface border border-theme rounded-xl text-sm font-bold outline-none focus:border-primary"
                                                            value={t.firstName}
                                                            onChange={(e) => {
                                                                const newNames = [...travelerNames];
                                                                newNames[i] = { ...t, firstName: e.target.value };
                                                                setTravelerNames(newNames);
                                                            }}
                                                        />
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Nachname"
                                                            className="w-full h-10 px-4 bg-surface border border-theme rounded-xl text-sm font-bold outline-none focus:border-primary"
                                                            value={t.lastName}
                                                            onChange={(e) => {
                                                                const newNames = [...travelerNames];
                                                                newNames[i] = { ...t, lastName: e.target.value };
                                                                setTravelerNames(newNames);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Meeting Point Box */}
                                    <div className="p-6 bg-blue-500/5 border-2 border-blue-500/20 rounded-3xl space-y-3">
                                        <div className="flex items-center gap-3 text-blue-600">
                                            <MapPin className="w-5 h-5 font-bold" />
                                            <h4 className="font-extrabold uppercase tracking-widest text-xs">Treffpunkt</h4>
                                        </div>
                                        <p className="text-sm font-bold text-foreground/80">Zentraler Platz am Haupteingang. Bitte 15 Min. vorher eintreffen.</p>
                                    </div>

                                    {/* Special Requests */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            Besondere Anforderungen (optional)
                                        </label>
                                        <textarea
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                            rows={4}
                                            className="w-full px-5 py-4 bg-surface-elevated border-2 border-transparent focus:border-primary/30 rounded-2xl transition-all outline-none font-bold resize-none"
                                            placeholder="Rollstuhlzugang, Diätwünsche, Allergien oder sonstige Hinweise für den Guide..."
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => setStep("contact")}
                                            variant="secondary"
                                            className="h-16 px-8 rounded-2xl font-black text-foreground"
                                        >
                                            Zurück
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isHolding}
                                            className="flex-1 h-16 rounded-2xl bg-primary text-white text-lg font-black shadow-xl shadow-primary/20"
                                        >
                                            {isHolding ? "Wird verarbeitet..." : "Weiter zur Bezahlung"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {step === "payment" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">3</div>
                                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Bezahlung</h2>
                                </div>

                                <div className="bg-surface border border-theme rounded-3xl p-8 shadow-sm">
                                    <ViatorPaymentForm
                                        paymentSessionToken={paymentSessionToken || ""}
                                        currency={currency}
                                        price={price * pax}
                                        cardholderName={`${bookerInfo.firstName} ${bookerInfo.lastName}`.trim()}
                                        theme="DARK"
                                        onPaymentSuccess={(token) => handlePaymentComplete(token)}
                                        onError={(msg) => {
                                            setError(msg);
                                            setStep("error");
                                        }}
                                    />

                                    <div className="mt-8 pt-8 border-t border-theme flex flex-wrap gap-4 justify-center grayscale opacity-40">
                                        <CreditCard className="w-8 h-8" />
                                        <div className="w-12 h-8 bg-muted-foreground/20 rounded" />
                                        <div className="w-12 h-8 bg-muted-foreground/20 rounded" />
                                        <div className="w-12 h-8 bg-muted-foreground/20 rounded" />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setStep("activity")}
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-[10px]"
                                >
                                    Reisedetails bearbeiten
                                </Button>
                            </div>
                        )}

                        {/* Processing / Success States */}
                        {(step === "processing" || step === "complete") && (
                            <div className="bg-surface border border-theme rounded-[3rem] p-16 text-center space-y-8 shadow-lg animate-in zoom-in-95 duration-500">
                                {step === "processing" ? (
                                    <>
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                                            <Shield className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-foreground mb-3">Buchung wird bestätigt...</h2>
                                            <p className="text-muted-foreground font-medium">Wir sichern gerade deine Tickets bei Viator. Bitte schließe dieses Fenster nicht.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40">
                                            <CheckCircle className="w-14 h-14" />
                                        </div>
                                        <div>
                                            <h2 className="text-4xl font-black text-foreground mb-4 tracking-tighter">Bereit für dein Abenteuer!</h2>
                                            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                                                Deine Buchung wurde erfolgreich bestätigt. Wir haben dir alle Details an <span className="text-primary font-black">{bookerInfo.email}</span> gesendet.
                                            </p>
                                        </div>

                                        <div className="p-6 bg-surface-elevated rounded-3xl border-2 border-theme border-dashed">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Buchungsnummer</p>
                                            <p className="text-2xl font-black text-foreground tracking-widest">{bookingRef}</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                            <Button
                                                onClick={() => router.push("/")}
                                                size="lg"
                                                className="h-16 px-10 rounded-2xl bg-foreground text-background font-black hover:scale-105 transition-transform"
                                            >
                                                Zur Startseite
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="lg"
                                                className="h-16 px-10 rounded-2xl font-black"
                                            >
                                                Buchung verwalten
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
