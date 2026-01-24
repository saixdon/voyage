"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { HeroSearchContainer } from "./HeroSearchContainer";

export function ScrollyTellingHero() {
    const t = useTranslations('hero');
    // Increased height for 5 stages
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Scene 1: Flight (0 - 0.2)
    const flightOpacity = useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0]);
    const flightScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
    const flightTextOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

    // Bridge 1: Cloud/Water Mix (0.15 - 0.35)
    // Overlaps slightly with Flight fade out
    const bridge1Opacity = useTransform(scrollYProgress, [0.15, 0.2, 0.3, 0.35], [0, 1, 1, 0]);
    const bridge1Scale = useTransform(scrollYProgress, [0.15, 0.35], [1.1, 1]);

    // Scene 2: Diving (0.3 - 0.55)
    const divingOpacity = useTransform(scrollYProgress, [0.3, 0.35, 0.5, 0.55], [0, 1, 1, 0]);
    const divingScale = useTransform(scrollYProgress, [0.3, 0.55], [1.1, 1]);
    const divingTextOpacity = useTransform(scrollYProgress, [0.35, 0.4, 0.45, 0.5], [0, 1, 1, 0]);

    // Bridge 2: Water/Snow Mix (0.5 - 0.75)
    const bridge2Opacity = useTransform(scrollYProgress, [0.5, 0.55, 0.7, 0.75], [0, 1, 1, 0]);
    const bridge2Scale = useTransform(scrollYProgress, [0.5, 0.75], [1.1, 1]);

    // Scene 3: Skiing (0.7 - 1.0)
    const skiingOpacity = useTransform(scrollYProgress, [0.7, 0.75, 1], [0, 1, 1]);
    const skiingScale = useTransform(scrollYProgress, [0.7, 1], [1.1, 1]);
    const skiingTextOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1]);


    return (
        <div ref={containerRef} className="relative h-[450vh] w-full">
            {/* Sticky Container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

                {/* --- SCENE 1: FLIGHT --- */}
                <motion.div style={{ opacity: flightOpacity, scale: flightScale }} className="absolute inset-0 z-10 w-full h-full">
                    <div className="absolute inset-0 bg-black/30 z-10" />
                    <img src="/activity_flight.png" alt="Flight" className="w-full h-full object-cover" />

                    <motion.div style={{ opacity: flightTextOpacity }} className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                        <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl mb-4 tracking-tighter">
                            {t('title1')} <span className="text-primary">{t('title2')}</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-light mb-10">
                            {t('subtitle')}
                        </p>
                        <div className="w-full max-w-3xl z-50">
                            <HeroSearchContainer />
                        </div>
                        <div className="mt-8 animate-bounce opacity-70">
                            <span className="material-symbols-outlined text-white text-4xl">keyboard_arrow_down</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* --- BRIDGE 1: SKY TO WATER --- */}
                <motion.div style={{ opacity: bridge1Opacity, scale: bridge1Scale }} className="absolute inset-0 z-15 w-full h-full">
                    <img src="/transition_bridge_1.png" alt="Dive Transition" className="w-full h-full object-cover" />
                </motion.div>

                {/* --- SCENE 2: DIVING --- */}
                <motion.div style={{ opacity: divingOpacity, scale: divingScale }} className="absolute inset-0 z-20 w-full h-full">
                    <div className="absolute inset-0 bg-black/20 z-10" />
                    <img src="/activity_diving.png" alt="Diving" className="w-full h-full object-cover" />

                    <motion.div style={{ opacity: divingTextOpacity }} className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                            Dive Deeper
                        </h2>
                        <Link href="/search?q=diving" className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white font-bold text-lg border border-white/40 transition-all hover:scale-105">
                            Show Diving Tours
                        </Link>
                    </motion.div>
                </motion.div>

                {/* --- BRIDGE 2: WATER TO SNOW --- */}
                <motion.div style={{ opacity: bridge2Opacity, scale: bridge2Scale }} className="absolute inset-0 z-25 w-full h-full">
                    <img src="/transition_bridge_2.png" alt="Snow Transition" className="w-full h-full object-cover" />
                </motion.div>

                {/* --- SCENE 3: SKIING --- */}
                <motion.div style={{ opacity: skiingOpacity, scale: skiingScale }} className="absolute inset-0 z-30 w-full h-full">
                    <div className="absolute inset-0 bg-black/20 z-10" />
                    <img src="/activity_skiing.png" alt="Skiing" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />

                    <motion.div style={{ opacity: skiingTextOpacity }} className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                            Reach New Heights
                        </h2>
                        <Link href="/search?q=skiing" className="px-8 py-4 bg-primary hover:bg-primary/90 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-primary/40 transition-all hover:scale-105">
                            Discover Mountains
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
