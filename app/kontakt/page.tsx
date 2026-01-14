"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");

        // Simulate form submission (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // For now, just show success (implement actual email sending later)
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Kontakt</h1>
                    <p className="text-gray-400 text-lg">
                        Haben Sie Fragen oder Anregungen? Wir freuen uns, von Ihnen zu hören!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary">mail</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">E-Mail</h3>
                                    <p className="text-gray-400">kontakt@tripvega.com</p>
                                    <p className="text-gray-400">support@tripvega.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary">schedule</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">Erreichbarkeit</h3>
                                    <p className="text-gray-400">Mo - Fr: 9:00 - 18:00 Uhr</p>
                                    <p className="text-gray-400">Sa - So: Geschlossen</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary">help</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">FAQ</h3>
                                    <p className="text-gray-400">
                                        Viele Fragen werden bereits in unseren{" "}
                                        <Link href="/faq" className="text-primary hover:underline">
                                            häufig gestellten Fragen
                                        </Link>{" "}
                                        beantwortet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        {status === "success" ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Nachricht gesendet!</h3>
                                <p className="text-gray-400 mb-6">
                                    Vielen Dank für Ihre Nachricht. Wir werden uns schnellstmöglich bei Ihnen melden.
                                </p>
                                <button
                                    onClick={() => setStatus("idle")}
                                    className="text-primary hover:underline"
                                >
                                    Weitere Nachricht senden
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-white font-medium mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Ihr Name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-white font-medium mb-2">
                                        E-Mail *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                        placeholder="ihre@email.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-white font-medium mb-2">
                                        Betreff *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="" className="bg-gray-900">Bitte wählen...</option>
                                        <option value="general" className="bg-gray-900">Allgemeine Anfrage</option>
                                        <option value="booking" className="bg-gray-900">Frage zur Buchung</option>
                                        <option value="partnership" className="bg-gray-900">Partnerschaft / Kooperation</option>
                                        <option value="technical" className="bg-gray-900">Technisches Problem</option>
                                        <option value="feedback" className="bg-gray-900">Feedback / Vorschläge</option>
                                        <option value="other" className="bg-gray-900">Sonstiges</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-white font-medium mb-2">
                                        Nachricht *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                                        placeholder="Ihre Nachricht..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(43,140,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === "sending" ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            Wird gesendet...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">send</span>
                                            Nachricht senden
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                    <Link href="/" className="text-primary hover:underline">
                        ← Zurück zur Startseite
                    </Link>
                </div>
            </div>
        </div>
    );
}
