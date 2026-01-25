"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import type { PaymentType, FormEvent as ViatorFormEvent, ColorTheme } from "payment-module/dist/types/types";

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

    const paymentRef = useRef<PaymentType | null>(null);
    const initAttemptedRef = useRef(false);
    const containerId = "viator-payment-iframe";

    // Initialize the payment form - now waits for DOM element to be available
    const initializePaymentForm = useCallback(async () => {
        if (!paymentSessionToken) {
            console.error("No payment session token provided");
            setSdkStatus("error");
            onError("Missing payment session token");
            return;
        }

        try {
            console.log("Loading Viator Payment SDK via NPM module...");

            // Wait a tick to ensure the container is in the DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify the container exists before proceeding
            const containerElement = document.getElementById(containerId);
            if (!containerElement) {
                console.error("Container element not found:", containerId);
                throw new Error("Payment container not found");
            }
            console.log("Container element found:", containerElement);

            // Dynamic import the NPM module
            const loadPayment = (await import("payment-module")).default;

            console.log("Viator Payment module loaded, initializing with token:", paymentSessionToken.substring(0, 30) + "...");

            // Load and initialize the payment SDK
            const payment = await loadPayment(paymentSessionToken);
            paymentRef.current = payment;

            console.log("Payment instance created, rendering card form...");

            // Get the correct ColorTheme enum value
            const colorThemeValue = theme as unknown as ColorTheme;

            // Render the card input iframe
            payment.renderCard({
                cardElementContainer: containerId,
                cardholderName: cardholderName,
                onFormUpdate: (event: ViatorFormEvent) => {
                    console.log("Form update:", event);
                    // Use formValid from the event
                    setIsFormValid(event.formValid);
                },
                styling: {
                    colorTheme: colorThemeValue,
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
            onError("Failed to load payment form. Please try again.");
        }
    }, [paymentSessionToken, cardholderName, theme, onError]);

    // Initialize on mount - with a small delay to ensure container is in DOM
    useEffect(() => {
        if (!initAttemptedRef.current && paymentSessionToken) {
            initAttemptedRef.current = true;
            // Small delay to ensure mount is complete
            const timer = setTimeout(() => {
                initializePaymentForm();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [paymentSessionToken, initializePaymentForm]);

    // Retry handler
    const handleRetry = () => {
        initAttemptedRef.current = false;
        setSdkStatus("loading");
        // Small delay before retry
        setTimeout(() => {
            initializePaymentForm();
        }, 200);
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
            // Submit the payment form with CardMetadata
            const result = await paymentRef.current.submitForm({
                address: {
                    country: billingCountry,
                    postalCode: postalCode,
                },
            });

            if (result.paymentToken) {
                console.log("Payment successful, card type:", result.cardData?.cardType);
                onPaymentSuccess(result.paymentToken);
            } else {
                throw new Error("Payment failed - no token received");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Payment failed. Please try again.";
            console.error("Payment submission error:", err);
            onError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (paymentRef.current) {
                try {
                    paymentRef.current.destruct();
                } catch {
                    // Ignore cleanup errors
                }
            }
        };
    }, []);

    return (
        <div className="w-full">
            {/* ALWAYS render the iframe container - even during loading */}
            {/* This ensures the DOM element exists before Viator SDK tries to inject */}
            <div className="space-y-6">
                {/* Viator iFrame Container - Always rendered but may be hidden */}
                <div className="bg-surface-elevated rounded-xl border border-theme overflow-hidden relative">
                    {/* Loading overlay */}
                    {sdkStatus === "loading" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-elevated z-10">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                            <p className="font-medium text-muted-foreground">Lade sicheres Zahlungsformular...</p>
                            <p className="text-sm text-muted-foreground mt-1">Powered by Viator</p>
                        </div>
                    )}

                    {/* Error overlay */}
                    {sdkStatus === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-elevated z-10 p-8">
                            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                            <p className="text-red-400 font-bold mb-2">Zahlungssystem nicht verfügbar</p>
                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                Bitte versuche es erneut oder kontaktiere den Support.
                            </p>
                            <button
                                onClick={handleRetry}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Erneut versuchen
                            </button>
                        </div>
                    )}

                    {/* The actual container where Viator SDK injects the iframe */}
                    <div
                        id={containerId}
                        className="min-h-[180px] p-4"
                    >
                        {/* Viator SDK injects the secure iframe here */}
                    </div>
                </div>

                {/* Only show billing and submit when ready */}
                {sdkStatus === "ready" && (
                    <>
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
                    </>
                )}
            </div>

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
