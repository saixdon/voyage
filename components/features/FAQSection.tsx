"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FAQItem {
    question: string;
    answer: string;
}

export function FAQSection() {
    const t = useTranslations('faq');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    // next-intl doesn't support array-based translations easily in some versions
    // So we fetch them one by one or assume a fixed count if needed, 
    // but usually, we can map over a range if we know it.
    // However, the JSON structure I added has "items" as an array.
    // In next-intl, to get an array of translations, we use t.raw or a special pattern.

    // For now, I'll assume 5 items as I added 5 in the JSON.
    const items = [0, 1, 2, 3, 4].map(idx => ({
        question: t(`items.${idx}.question`),
        answer: t(`items.${idx}.answer`)
    }));

    return (
        <section className="my-32">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                    {t('title')}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {t('subtitle')}
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "rounded-2xl border transition-all duration-300 overflow-hidden",
                            openIndex === idx
                                ? "bg-surface-elevated border-primary/30 shadow-lg shadow-primary/5"
                                : "bg-surface border-theme hover:border-primary/20"
                        )}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left group"
                        >
                            <span className={cn(
                                "text-lg font-bold transition-colors",
                                openIndex === idx ? "text-primary" : "text-foreground group-hover:text-primary/80"
                            )}>
                                {item.question}
                            </span>
                            <span className={cn(
                                "material-symbols-outlined transition-transform duration-300",
                                openIndex === idx ? "rotate-180 text-primary" : "text-muted-foreground"
                            )}>
                                keyboard_arrow_down
                            </span>
                        </button>

                        <AnimatePresence>
                            {openIndex === idx && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                        {item.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Call to action below FAQ */}
            <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">{t('stillQuestions')}</p>
                <div className="flex justify-center gap-4">
                    <button className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-105">
                        {t('contactSupport')}
                    </button>
                    <button className="px-6 py-3 bg-surface border border-theme text-foreground font-medium rounded-full hover:bg-surface-elevated transition-all">
                        {t('helpCenter')}
                    </button>
                </div>
            </div>
        </section>
    );
}
