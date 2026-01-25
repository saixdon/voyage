"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, ShieldCheck, AlertTriangle, RefreshCw, Bug } from "lucide-react";
import type { PaymentType, FormEvent as ViatorFormEvent, ColorTheme } from "payment-module/dist/types/types";

// Debug logging helper with timestamps
const DEBUG_ENABLED = true;
const debugLogs: string[] = [];

function debugLog(step: string, data?: unknown) {
    if (!DEBUG_ENABLED) return;
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    const message = `[${timestamp}] ${step}`;
    console.log(`🔍 VIATOR DEBUG: ${message}`, data !== undefined ? data : '');
    debugLogs.push(`${message}${data !== undefined ? ': ' + JSON.stringify(data, null, 2) : ''}`);
}

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
    const [showDebug, setShowDebug] = useState(false);
    const [debugMessages, setDebugMessages] = useState<string[]>([]);

    // Billing address state (required by Viator)
    const [billingCountry, setBillingCountry] = useState("DE");
    const [postalCode, setPostalCode] = useState("");
    const [email, setEmail] = useState("");

    const paymentRef = useRef<PaymentType | null>(null);
    const initAttemptedRef = useRef(false);
    const containerId = "viator-payment-iframe";

    // Update debug messages for display
    const updateDebugDisplay = useCallback(() => {
        setDebugMessages([...debugLogs]);
    }, []);

    // Initialize the payment form - now waits for DOM element to be available
    const initializePaymentForm = useCallback(async () => {
        debugLog("Step 1: initializePaymentForm called");

        if (!paymentSessionToken) {
            debugLog("Step 1.1: ERROR - No payment session token", { tokenLength: 0 });
            setSdkStatus("error");
            onError("Missing payment session token");
            updateDebugDisplay();
            return;
        }

        debugLog("Step 1.2: Token received", {
            tokenLength: paymentSessionToken.length,
            tokenPreview: paymentSessionToken.substring(0, 50) + "..."
        });

        try {
            debugLog("Step 2: Waiting 100ms for DOM...");
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check DOM state
            const containerElement = document.getElementById(containerId);
            debugLog("Step 3: DOM Check", {
                containerId,
                containerExists: !!containerElement,
                containerHTML: containerElement?.innerHTML?.substring(0, 100),
                documentReady: document.readyState,
                bodyExists: !!document.body
            });

            if (!containerElement) {
                debugLog("Step 3.1: ERROR - Container not found!", { containerId });
                throw new Error("Payment container not found");
            }

            debugLog("Step 4: Importing payment-module NPM package...");

            // Check if window.Payment already exists
            debugLog("Step 4.1: Pre-import window state", {
                windowPayment: typeof (window as unknown as Record<string, unknown>).Payment,
                windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('payment'))
            });

            const loadPayment = (await import("payment-module")).default;
            debugLog("Step 5: payment-module imported successfully", {
                loadPaymentType: typeof loadPayment,
                isFunction: typeof loadPayment === 'function'
            });

            debugLog("Step 6: Calling loadPayment(token)...");
            const startTime = Date.now();

            // Add a timeout wrapper to detect hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("SDK initialization timed out after 15s")), 15000);
            });

            const payment = await Promise.race([
                loadPayment(paymentSessionToken),
                timeoutPromise
            ]) as PaymentType;

            const loadTime = Date.now() - startTime;
            debugLog("Step 7: loadPayment resolved", {
                loadTimeMs: loadTime,
                paymentType: typeof payment,
                paymentMethods: payment ? Object.keys(payment) : 'null'
            });

            paymentRef.current = payment;

            // Check window.Payment after SDK load
            debugLog("Step 7.1: Post-load window state", {
                windowPayment: typeof (window as unknown as Record<string, unknown>).Payment,
                windowWindowPayment: typeof (window as unknown as { window?: { Payment?: unknown } }).window?.Payment
            });

            debugLog("Step 8: Calling payment.renderCard()...");
            const colorThemeValue = theme as unknown as ColorTheme;

            payment.renderCard({
                cardElementContainer: containerId,
                cardholderName: cardholderName,
                onFormUpdate: (event: ViatorFormEvent) => {
                    debugLog("Form Update Event", { formValid: event.formValid, event });
                    setIsFormValid(event.formValid);
                    updateDebugDisplay();
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

            debugLog("Step 9: renderCard() called, checking container...");

            // Check what was injected
            setTimeout(() => {
                const containerAfter = document.getElementById(containerId);
                debugLog("Step 10: Post-render container check", {
                    containerHTML: containerAfter?.innerHTML?.substring(0, 200),
                    hasIframe: containerAfter?.querySelector('iframe') ? true : false,
                    iframes: document.querySelectorAll('iframe').length,
                    childNodes: containerAfter?.childNodes.length
                });
                updateDebugDisplay();
            }, 1000);

            setSdkStatus("ready");
            debugLog("Step 11: SDK Status set to READY ✅");
            updateDebugDisplay();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            debugLog("ERROR: SDK initialization failed", {
                error: errorMessage,
                stack: err instanceof Error ? err.stack : undefined
            });
            console.error("Failed to initialize Viator Payment:", err);
            setSdkStatus("error");
            onError("Failed to load payment form. Please try again.");
            updateDebugDisplay();
        }
    }, [paymentSessionToken, cardholderName, theme, onError, updateDebugDisplay]);

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
                    {/* The actual container where Viator SDK injects the iframe */}
                    <div
                        id={containerId}
                        className="min-h-[500px] w-full h-full p-4 relative z-0"
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

            {/* Debug Panel */}
            {DEBUG_ENABLED && (
                <div className="mt-6 border border-yellow-500/30 rounded-xl overflow-hidden">
                    <button
                        onClick={() => {
                            updateDebugDisplay();
                            setShowDebug(!showDebug);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-sm font-mono transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            🔍 SDK Debug Logs ({debugMessages.length} entries)
                        </span>
                        <span>{showDebug ? '▲ Hide' : '▼ Show'}</span>
                    </button>

                    {showDebug && (
                        <div className="bg-gray-900 p-4 max-h-[400px] overflow-y-auto">
                            <div className="space-y-1 font-mono text-xs">
                                {debugMessages.length === 0 ? (
                                    <p className="text-gray-500">Keine Logs vorhanden. Warte auf SDK-Initialisierung...</p>
                                ) : (
                                    debugMessages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`py-1 px-2 rounded ${msg.includes('ERROR') ? 'bg-red-500/20 text-red-400' :
                                                msg.includes('READY') || msg.includes('✅') ? 'bg-green-500/20 text-green-400' :
                                                    'text-gray-300'
                                                }`}
                                        >
                                            <pre className="whitespace-pre-wrap break-all">{msg}</pre>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                                <button
                                    onClick={() => {
                                        const info = {
                                            token: paymentSessionToken?.substring(0, 50) + '...',
                                            sdkStatus,
                                            containerId,
                                            containerExists: !!document.getElementById(containerId),
                                            iframes: document.querySelectorAll('iframe').length,
                                            windowPayment: typeof (window as unknown as Record<string, unknown>).Payment
                                        };
                                        console.log('📋 Current State:', info);
                                        alert(JSON.stringify(info, null, 2));
                                    }}
                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30"
                                >
                                    📋 Show State
                                </button>
                                <button
                                    onClick={() => {
                                        debugLogs.length = 0;
                                        updateDebugDisplay();
                                    }}
                                    className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded text-xs hover:bg-gray-500/30"
                                >
                                    🗑️ Clear Logs
                                </button>
                                <button
                                    onClick={() => {
                                        initAttemptedRef.current = false;
                                        setSdkStatus("loading");
                                        debugLog("Manual Retry triggered");
                                        setTimeout(() => initializePaymentForm(), 200);
                                    }}
                                    className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded text-xs hover:bg-orange-500/30"
                                >
                                    🔄 Force Retry
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
