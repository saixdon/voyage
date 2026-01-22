"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

interface ViatorPaymentFormProps {
    /** Payment Session Token from /bookings/cart/hold response */
    paymentSessionToken: string;
    /** Currency code (EUR, USD, etc.) */
    currency: string;
    /** Total price to display */
    price: number;
    /** Callback when payment succeeds - receives paymentToken for /bookings/cart/book */
    onPaymentSuccess: (paymentToken: string) => void;
    /** Callback when payment fails */
    onError: (error: string) => void;
    /** Optional: Cardholder name pre-fill */
    cardholderName?: string;
    /** Optional: Theme (LIGHT or DARK) */
    theme?: "LIGHT" | "DARK";
}

// Official Viator Payment SDK URL
const VIATOR_SDK_URL = "https://checkout-assets.payments.tamg.cloud/stable/v2/payment.js";

// Viator Payment SDK Types
declare global {
    interface Window {
        Payment?: {
            new(sessionToken: string): ViatorPaymentInstance;
            init(sessionToken: string): ViatorPaymentInstance;
        };
    }
}

interface ViatorPaymentInstance {
    renderCard(options: RenderCardOptions): void;
    submitForm(data: SubmitFormData): Promise<PaymentResult>;
    submitDeviceData(): void;
}

interface RenderCardOptions {
    cardElementContainer: string;
    cardholderName?: string;
    onFormUpdate?: (event: FormUpdateEvent) => void;
    styling?: {
        colorTheme?: "LIGHT" | "DARK";
        variables?: {
            fontSize?: string;
            colorInputBackground?: string;
            colorBackground?: string;
            colorPrimaryText?: string;
        };
    };
}

interface SubmitFormData {
    address: {
        country: string;
        postalCode: string;
    };
    email?: string;
    phoneNumber?: string;
}

interface PaymentResult {
    result: "SUCCESS" | "ERROR";
    paymentToken?: string;
    cardData?: {
        cardType: string;
    };
    error?: string;
}

interface FormUpdateEvent {
    valid: boolean;
    complete: boolean;
}

export function ViatorPaymentForm({
    paymentSessionToken,
    currency,
    price,
    onPaymentSuccess,
    onError,
    cardholderName,
    theme = "DARK"
}: ViatorPaymentFormProps) {
    const [sdkStatus, setSdkStatus] = useState<"loading" | "ready" | "error">("loading");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    // Billing address state (required by Viator)
    const [billingCountry, setBillingCountry] = useState("DE");
    const [postalCode, setPostalCode] = useState("");
    const [email, setEmail] = useState("");

    const paymentRef = useRef<ViatorPaymentInstance | null>(null);
    const containerId = "viator-payment-iframe";

    // Initialize the payment form when SDK loads
    const initializePaymentForm = useCallback(() => {
        if (!window.Payment) {
            console.error("Viator Payment SDK not available on window");
            setSdkStatus("error");
            onError("Payment system unavailable");
            return;
        }

        if (!paymentSessionToken) {
            console.error("No payment session token provided");
            setSdkStatus("error");
            onError("Missing payment session token");
            return;
        }

        try {
            console.log("Initializing Viator Payment with token:", paymentSessionToken.substring(0, 20) + "...");

            // Use init() method as recommended by Viator
            const payment = window.Payment.init(paymentSessionToken);
            paymentRef.current = payment;

            // Render the card input iframe
            payment.renderCard({
                cardElementContainer: containerId,
                cardholderName: cardholderName,
                onFormUpdate: (event: FormUpdateEvent) => {
                    setIsFormValid(event.valid && event.complete);
                },
                styling: {
                    colorTheme: theme,
                    variables: {
                        colorBackground: theme === "DARK" ? "#1c2127" : "#ffffff",
                        colorPrimaryText: theme === "DARK" ? "#ffffff" : "#0f172a",
                        colorInputBackground: theme === "DARK" ? "#12121a" : "#f8fafc",
                        fontSize: "1rem",
                    },
                },
            });

            setSdkStatus("ready");
            console.log("Viator Payment iFrame rendered successfully");
        } catch (err) {
            console.error("Failed to initialize Viator Payment:", err);
            setSdkStatus("error");
            onError("Failed to load payment form");
        }
    }, [paymentSessionToken, cardholderName, theme, onError]);

    // Handle script load
    const handleScriptLoad = () => {
        console.log("Viator Payment SDK script loaded");
        // Small delay to ensure the script is fully initialized
        setTimeout(initializePaymentForm, 100);
    };

    const handleScriptError = () => {
        console.error("Failed to load Viator Payment SDK script");
        setSdkStatus("error");
        onError("Failed to load payment system");
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!paymentRef.current) {
            onError("Payment form not initialized");
            return;
        }

        if (!postalCode) {
            onError("Bitte gib deine Postleitzahl ein");
            return;
        }

        setIsProcessing(true);

        try {
            // Submit fraud detection data first
            paymentRef.current.submitDeviceData();

            // Submit the payment form
            const result = await paymentRef.current.submitForm({
                address: {
                    country: billingCountry,
                    postalCode: postalCode,
                },
                email: email || undefined,
            });

            if (result.result === "SUCCESS" && result.paymentToken) {
                console.log("Payment successful, card type:", result.cardData?.cardType);
                onPaymentSuccess(result.paymentToken);
            } else {
                throw new Error(result.error || "Payment failed");
            }
        } catch (err: any) {
            console.error("Payment submission error:", err);
            onError(err.message || "Payment failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full">
            {/* Load Viator Payment SDK */}
            <Script
                src={VIATOR_SDK_URL}
                onLoad={handleScriptLoad}
                onError={handleScriptError}
                strategy="lazyOnload"
            />

            {/* Loading State */}
            {sdkStatus === "loading" && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                    <p className="font-medium">Lade sicheres Zahlungsformular...</p>
                    <p className="text-sm text-muted-foreground mt-1">Powered by Viator</p>
                </div>
            )}

            {/* Error State */}
            {sdkStatus === "error" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-400 font-bold mb-2">Zahlungssystem nicht verfügbar</p>
                    <p className="text-sm text-muted-foreground">
                        Bitte versuche es später erneut oder kontaktiere den Support.
                    </p>
                </div>
            )}

            {/* Payment Form */}
            {sdkStatus === "ready" && (
                <div className="space-y-6">
                    {/* Viator iFrame Container */}
                    <div className="bg-surface-elevated rounded-xl border border-theme overflow-hidden">
                        <div
                            id={containerId}
                            className="min-h-[180px] p-4"
                        >
                            {/* Viator SDK injects the secure iframe here */}
                        </div>
                    </div>

                    {/* Billing Address (Required by Viator) */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            Rechnungsadresse
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Land</label>
                                <select
                                    value={billingCountry}
                                    onChange={(e) => setBillingCountry(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-elevated border border-theme rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="DE">Deutschland</option>
                                    <option value="AT">Österreich</option>
                                    <option value="CH">Schweiz</option>
                                    <option value="US">USA</option>
                                    <option value="GB">UK</option>
                                    <option value="FR">Frankreich</option>
                                    <option value="ES">Spanien</option>
                                    <option value="IT">Italien</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Postleitzahl *</label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="12345"
                                    required
                                    className="w-full h-11 px-3 bg-surface-elevated border border-theme rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">E-Mail (für Bestätigung)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="deine@email.de"
                                className="w-full h-11 px-3 bg-surface-elevated border border-theme rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !isFormValid || !postalCode}
                        className="w-full h-14 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Verarbeite Zahlung...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-5 h-5" />
                                <span>Jetzt bezahlen: {currency} {price.toFixed(2)}</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    SSL verschlüsselt
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    PCI-DSS konform
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span>Powered by Viator</span>
            </div>
        </div>
    );
}
