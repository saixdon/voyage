"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LandingBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
            {/* Dark Mode: Brighter, Faster Stars */}
            <div className="hidden dark:block absolute inset-0">
                <NightStars />
            </div>

            {/* Light Mode: Visible Atmosphere with High Contrast Particles */}
            <div className="block dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/40 via-transparent to-transparent">
                <DayAtmosphere />
            </div>
        </div>
    );
}

function NightStars() {
    const [stars, setStars] = useState<{ x: number; y: number; opacity: number; duration: number; delay: number; scale: number }[]>([]);

    useEffect(() => {
        const starCount = 200;
        const newStars = Array.from({ length: starCount }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: Math.random() * 0.5 + 0.5, // Brighter stars (0.5 to 1.0)
            duration: 0.8 + Math.random() * 1.5, // Faster twinkle
            delay: Math.random() * 2,
            scale: Math.random() * 1.5 + 0.5 // Larger scale variation
        }));
        setStars(newStars);
    }, []);

    return (
        <>
            {stars.map((star, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,1)]"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: Math.random() > 0.9 ? '3px' : '2px',
                        height: Math.random() > 0.9 ? '3px' : '2px',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [star.opacity, 1, star.opacity * 0.3, 1], // More intense flickering
                        scale: [star.scale, star.scale * 1.5, star.scale * 0.8, star.scale] // Pulse effect
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: star.delay
                    }}
                />
            ))}
        </>
    );
}

function DayAtmosphere() {
    // 1. Visible Particles (Dark Grey/Blue)
    // 2. Birds (Darker)
    const [particles, setParticles] = useState<{ x: number; y: number; size: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        const count = 60;
        const newParticles = Array.from({ length: count }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 5 + 3, // Larger particles (3-8px)
            duration: 12 + Math.random() * 10,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    return (
        <>
            {/* Background Blobs for specific mountain feel */}
            <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px]" />
            <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[150px]" />

            {/* Clearly Visible Floating Particles (Slate-500) */}
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-slate-500/30"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                    }}
                    animate={{
                        y: [0, -150],
                        x: [0, Math.random() * 50 - 25],
                        opacity: [0, 0.8, 0] // Higher opacity
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay
                    }}
                />
            ))}

            {/* Dark Birds */}
            <BirdAnimation duration={35} delay={0} top={12} scale={0.7} />
            <BirdAnimation duration={40} delay={15} top={35} scale={0.5} />
            <BirdAnimation duration={28} delay={8} top={20} scale={0.6} />
        </>
    );
}

function BirdAnimation({ duration, delay, top, scale }: { duration: number, delay: number, top: number, scale: number }) {
    return (
        <motion.div
            className="absolute left-[-60px] text-slate-600/80 dark:hidden" // Darker color
            style={{ top: `${top}%` }}
            animate={{
                x: ['-10vw', '110vw'],
                y: [0, -40, 10, -20]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay
            }}
        >
            <div style={{ transform: `scale(${scale}) rotate(15deg)` }}>
                <svg width="50" height="40" viewBox="0 0 50 40" fill="currentColor">
                    <path d="M5 20 Q 20 5 35 20 Q 20 15 5 20" />
                    <path d="M35 20 Q 42 15 48 20 Q 42 22 35 20" />
                </svg>
            </div>
        </motion.div>
    );
}
