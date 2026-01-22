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
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Contact</h1>
                    <p className="text-muted-foreground text-lg">
                        Do you have any questions or suggestions? We look forward to hearing from you!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-surface border border-theme rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary">mail</span>
                                </div>
                                <div>
                                    <h3 className="text-foreground font-semibold mb-1">E-Mail</h3>
                                    <p className="text-muted-foreground">contact@tripvega.com</p>
                                    <p className="text-muted-foreground">support@tripvega.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface border border-theme rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary">schedule</span>
                                </div>
                                <div>
                                    <h3 className="text-foreground font-semibold mb-1">Availability</h3>
                                    <p className="text-muted-foreground">Mon - Fri: 9:00 AM - 6:00 PM</p>
                                    <p className="text-muted-foreground">Sat - Sun: Closed</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface border border-theme rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary">help</span>
                                </div>
                                <div>
                                    <h3 className="text-foreground font-semibold mb-1">FAQ</h3>
                                    <p className="text-muted-foreground">
                                        Many questions are already answered in our{" "}
                                        <Link href="/faq" className="text-primary hover:underline">
                                            frequently asked questions
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-surface border border-theme rounded-2xl p-8 shadow-sm">
                        {status === "success" ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">Message sent!</h3>
                                <p className="text-muted-foreground mb-6">
                                    Thank you for your message. We will get back to you as soon as possible.
                                </p>
                                <button
                                    onClick={() => setStatus("idle")}
                                    className="text-primary hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-foreground font-medium mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-background border border-theme rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Your Name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-foreground font-medium mb-2">
                                        E-Mail *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-background border border-theme rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-foreground font-medium mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-background border border-theme rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                                    >
                                        <option value="">Please select...</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="booking">Question about Booking</option>
                                        <option value="partnership">Partnership / Cooperation</option>
                                        <option value="technical">Technical Problem</option>
                                        <option value="feedback">Feedback / Suggestions</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-foreground font-medium mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 bg-background border border-theme rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                                        placeholder="Your message..."
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
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">send</span>
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-theme">
                    <Link href="/" className="text-primary hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
