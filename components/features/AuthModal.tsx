"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AuthModal(props: AuthModalProps) {
    const { isOpen, onClose } = props;
    const t = useTranslations('auth');
    const commonT = useTranslations('common');
    const locale = useLocale();

    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        try {
            const { signInAction, signUpAction } = await import("@/app/actions/auth");

            if (mode === "login") {
                const result = await signInAction(formData);
                if (result.error) throw new Error(result.error);

                if (result.session) {
                    await supabase.auth.setSession(result.session);
                }

                setSuccess(t('loginSuccess') || "Login successful!");

                setTimeout(() => {
                    if (onClose) onClose();
                    if (props.onSuccess) {
                        props.onSuccess();
                    }
                }, 1000);
            } else {
                const result = await signUpAction(formData);
                if (result.error) throw new Error(result.error);

                if (result.session) {
                    await supabase.auth.setSession(result.session);
                    setSuccess(t('loginSuccess'));
                    setTimeout(() => {
                        if (onClose) onClose();
                        if (props.onSuccess) {
                            props.onSuccess();
                        }
                    }, 1000);
                } else {
                    setSuccess(t('registerSuccess'));
                    setTimeout(() => {
                        if (onClose) onClose();
                    }, 2000);
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : commonT('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Background Glow Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500/20 rounded-full blur-[80px]" />
            </div>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-all"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">
                            {mode === "login" ? "login" : "person_add"}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        {mode === "login" ? t('welcomeBack') : t('createAccount')}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {mode === "login"
                            ? t('loginSubtitle')
                            : t('registerSubtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 px-4 bg-background border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            placeholder="du@beispiel.de"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 px-4 bg-background border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">error</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(43,140,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                {mode === "login" ? t('loggingIn') : commonT('loading')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">
                                    {mode === "login" ? "login" : "person_add"}
                                </span>
                                {mode === "login" ? t('signIn') : t('signUp')}
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-muted-foreground">{t('or')}</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Google Button */}
                <button
                    type="button"
                    onClick={async () => {
                        try {
                            const { error } = await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`,
                                    queryParams: {
                                        access_type: 'offline',
                                        prompt: 'consent',
                                    },
                                },
                            });
                            if (error) throw error;
                        } catch (error) {
                            console.error('Error logging in with Google:', error);
                            setError("Google Login fehlgeschlagen. Bitte versuche es erneut.");
                        }
                    }}
                    className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-medium rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/5 group mb-4"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </button>

                {/* Link to full page */}
                <Link
                    href={mode === "login" ? `/${locale}/login` : `/${locale}/register`}
                    className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    onClick={onClose}
                >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                    {mode === "login" ? "Zur Login-Seite" : "Zur Registrierungs-Seite"}
                </Link>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                        {mode === "login" ? (
                            <>
                                {t('noAccount')}{" "}
                                <button
                                    onClick={() => setMode("register")}
                                    className="text-primary hover:underline font-medium"
                                >
                                    {t('signUp')}
                                </button>
                            </>
                        ) : (
                            <>
                                {t('hasAccount')}{" "}
                                <button
                                    onClick={() => setMode("login")}
                                    className="text-primary hover:underline font-medium"
                                >
                                    {t('signIn')}
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
