"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { signInAction } = await import("@/app/actions/auth");
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            const result = await signInAction(formData);

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.session) {
                await supabase.auth.setSession(result.session);
            }

            router.push(`/${locale}`);
            router.refresh();
        } catch (err) {
            setError("Ein unerwarteter Fehler ist aufgetreten.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
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
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[120px]" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Glass Card */}
                <div className="bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 md:p-12 shadow-2xl">
                    {/* Logo / Brand */}
                    <div className="text-center mb-10">
                        <Link href={`/${locale}`} className="inline-block mb-6">
                            <img
                                src="/brand/logo_transparent.png"
                                alt="TripVega"
                                className="h-12 mx-auto dark:brightness-100 brightness-0"
                            />
                        </Link>
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            {t("welcomeBack")}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {t("loginSubtitle")}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                                {t("email")}
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

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-foreground/80">
                                    {t("password")}
                                </label>
                                <Link
                                    href={`/${locale}/forgot-password`}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {t("forgotPassword")}
                                </Link>
                            </div>
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

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(43,140,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                        {t("loggingIn")}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">login</span>
                                        {t("signIn")}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-muted-foreground">{t("or")}</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-medium rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/5 group"
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

                    {/* Register Link */}
                    <p className="text-center text-sm text-muted-foreground mt-8">
                        {t("noAccount")}{" "}
                        <Link
                            href={`/${locale}/register`}
                            className="text-primary hover:underline font-medium"
                        >
                            {t("signUp")}
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <Link
                        href={`/${locale}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Zurück zur Startseite
                    </Link>
                </div>
            </div>
        </div>
    );
}
