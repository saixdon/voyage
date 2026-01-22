"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

interface SettingsFormProps {
    user: {
        name: string | null;
        email: string | undefined;
    };
    updateAction: (formData: FormData) => Promise<any>;
}

export default function SettingsForm({ user, updateAction }: SettingsFormProps) {
    const t = useTranslations("dashboard.settings");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setMessage(null);
        try {
            const result = await updateAction(formData);
            if (result?.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: "Profile updated successfully" });
            }
        } catch (e) {
            setMessage({ type: 'error', text: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-xl">
            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                    {t("email")}
                </label>
                <div className="relative">
                    <input
                        id="email"
                        type="email"
                        value={user.email || ""}
                        readOnly
                        aria-label="email"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground cursor-not-allowed"
                    />
                    <span className="absolute right-4 top-3.5 material-symbols-outlined text-muted-foreground text-sm">
                        lock
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Email cannot be changed directly.
                </p>
            </div>

            <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    {t("name")}
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={user.name || ""}
                    aria-label="name"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    aria-label="save"
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined">save</span>
                    )}
                    {t("save")}
                </button>
            </div>
        </form>
    );
}
