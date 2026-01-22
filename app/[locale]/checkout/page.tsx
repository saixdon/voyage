"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import {
    ArrowLeft,
    Calendar,
    Users,
    Clock,
    Shield,
    CreditCard,
    Loader2,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { ViatorPaymentForm } from "@/components/checkout/ViatorPaymentForm";

interface BookerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

type CheckoutStep = "info" | "payment" | "processing" | "complete" | "error";

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
    const pax = parseInt(searchParams.get("pax") || "1", 10);
    const price = parseFloat(searchParams.get("price") || "0");
    const currency = searchParams.get("currency") || "EUR";
    const productOptionCode = searchParams.get("optionCode") || "DEFAULT";

    // State
    const [step, setStep] = useState<CheckoutStep>("info");
    const [bookerInfo, setBookerInfo] = useState<BookerInfo>({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    });
    const [cartRef, setCartRef] = useState<string | null>(null);
    const [paymentSessionToken, setPaymentSessionToken] = useState<string | null>(null);
    const [bookingRef, setBookingRef] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHolding, setIsHolding] = useState(false);

    // Validate required params
    useEffect(() => {
        if (!productCode || !dateStr) {
            setError("Fehlende Buchungsparameter. Bitte zurück zur Aktivität.");
        }
    }, [productCode, dateStr]);

    // Create Cart Hold when user submits info
    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsHolding(true);
        setError(null);

        try {
            const holdResponse = await fetch("/api/bookings/hold", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [{
                        productCode,
                        productOptionCode,
                        travelDate: dateStr,
                        paxMix: [{ ageBand: "ADULT", numberOfTravelers: pax }]
                    }],
                    currency
                })
            });

            const holdData = await holdResponse.json();

            if (holdData.error) {
                setError(holdData.error);
                setStep("error");
                return;
            }

            setCartRef(holdData.cartRef);
            // paymentSessionToken comes from the hold response (may be same as cartRef or separate)
            setPaymentSessionToken(holdData.paymentSessionToken || holdData.cartRef);
            setStep("payment");
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
            {/* Header */}
            <div className="sticky top-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-theme">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href={`/activities/${productCode}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Zurück</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Sichere Zahlung</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                    {/* Left: Summary */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="sticky top-32 bg-surface border border-theme rounded-3xl overflow-hidden">
                            {productImage && (
                                <div className="relative aspect-video">
                                    <Image
                                        src={decodeURIComponent(productImage)}
                                        alt={productTitle}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-6 space-y-4">
                                <h2 className="text-xl font-bold text-foreground">{decodeURIComponent(productTitle)}</h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>{formatDate(dateStr)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span>{pax} {pax === 1 ? "Person" : "Personen"}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-theme">
                                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                                        <span>{currency} {price.toFixed(2)} × {pax}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-foreground">Gesamt</span>
                                        <span className="text-2xl font-black text-primary">{currency} {totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form & Steps */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        {/* Error State */}
                        {step === "error" && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-foreground mb-2">Fehler</h2>
                                <p className="text-muted-foreground mb-6">{error}</p>
                                <Button onClick={() => setStep("info")} className="bg-primary hover:bg-primary/90">
                                    Erneut versuchen
                                </Button>
                            </div>
                        )}

                        {/* Step 1: Booker Info */}
                        {step === "info" && (
                            <div className="bg-surface border border-theme rounded-3xl p-8">
                                <h2 className="text-2xl font-bold text-foreground mb-6">Deine Daten</h2>

                                <form onSubmit={handleInfoSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Vorname</label>
                                            <input
                                                type="text"
                                                required
                                                value={bookerInfo.firstName}
                                                onChange={(e) => setBookerInfo({ ...bookerInfo, firstName: e.target.value })}
                                                className="w-full h-12 px-4 bg-surface-elevated border border-theme rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="Max"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nachname</label>
                                            <input
                                                type="text"
                                                required
                                                value={bookerInfo.lastName}
                                                onChange={(e) => setBookerInfo({ ...bookerInfo, lastName: e.target.value })}
                                                className="w-full h-12 px-4 bg-surface-elevated border border-theme rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="Mustermann"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">E-Mail</label>
                                        <input
                                            type="email"
                                            required
                                            value={bookerInfo.email}
                                            onChange={(e) => setBookerInfo({ ...bookerInfo, email: e.target.value })}
                                            className="w-full h-12 px-4 bg-surface-elevated border border-theme rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            placeholder="max@beispiel.de"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Telefon (optional)</label>
                                        <input
                                            type="tel"
                                            value={bookerInfo.phone}
                                            onChange={(e) => setBookerInfo({ ...bookerInfo, phone: e.target.value })}
                                            className="w-full h-12 px-4 bg-surface-elevated border border-theme rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            placeholder="+49 123 456789"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 mt-6"
                                        disabled={isHolding}
                                    >
                                        {isHolding ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Reserviere...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5" />
                                                Weiter zur Zahlung
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === "payment" && (
                            <div className="bg-surface border border-theme rounded-3xl p-8">
                                <h2 className="text-2xl font-bold text-foreground mb-6">Zahlung</h2>

                                {/* Viator Payment iFrame */}
                                <ViatorPaymentForm
                                    paymentSessionToken={paymentSessionToken || ""}
                                    currency={currency}
                                    price={totalPrice}
                                    cardholderName={`${bookerInfo.firstName} ${bookerInfo.lastName}`.trim()}
                                    theme="DARK"
                                    onPaymentSuccess={(token) => handlePaymentComplete(token)}
                                    onError={(msg) => {
                                        setError(msg);
                                        setStep("error");
                                    }}
                                />
                            </div>
                        )}

                        {/* Step 3: Processing */}
                        {step === "processing" && (
                            <div className="bg-surface border border-theme rounded-3xl p-16 text-center">
                                <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                                <h2 className="text-2xl font-bold text-foreground mb-2">Buchung wird verarbeitet...</h2>
                                <p className="text-muted-foreground">Bitte warten, schließe diese Seite nicht.</p>
                            </div>
                        )}

                        {/* Step 4: Complete */}
                        {step === "complete" && (
                            <div className="bg-surface border border-theme rounded-3xl p-12 text-center">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-foreground mb-4">Buchung bestätigt!</h2>
                                <p className="text-muted-foreground mb-2">
                                    Deine Buchungsnummer: <span className="font-mono font-bold text-primary">{bookingRef}</span>
                                </p>
                                <p className="text-sm text-muted-foreground mb-8">
                                    Eine Bestätigungs-E-Mail wurde an {bookerInfo.email} gesendet.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={() => router.push("/")}
                                        size="lg"
                                        className="bg-primary hover:bg-primary/90 rounded-xl"
                                    >
                                        Zurück zur Startseite
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
