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
