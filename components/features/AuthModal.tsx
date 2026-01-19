"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { useTranslations } from "next-intl";

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const t = useTranslations('auth');
    const commonT = useTranslations('common');

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

        try {
            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                setSuccess(t('loginSuccess') || "Login successful!");
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1000);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                if (data.session) {
                    setSuccess(t('loginSuccess'));
                    setTimeout(() => {
                        onClose();
                        window.location.reload();
                    }, 1000);
                } else {
                    setSuccess(t('registerSuccess'));
                    // Falls Email-Bestätigung nötig ist
                    setTimeout(() => {
                        onClose();
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
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-card-dark border border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {mode === "login" ? t('signIn') : t('signUp')}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {mode === "login"
                            ? t('loginSubtitle')
                            : t('registerSubtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(43,140,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined animate-spin">
                                    progress_activity
                                </span>
                                {commonT('loading')}
                            </span>
                        ) : mode === "login" ? (
                            t('signIn')
                        ) : (
                            t('signUp')
                        )}
                    </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
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
