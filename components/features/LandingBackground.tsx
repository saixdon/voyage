"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LandingBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
            {/* Dark Mode: Brighter, denser Stars */}
            <div className="hidden dark:block absolute inset-0">
                <NightStars />
            </div>

            {/* Light Mode: Visible Floating Elements & Soft Clouds */}
            <div className="block dark:hidden absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50">
                <DayAtmosphere />
            </div>
        </div>
    );
}

function NightStars() {
    const [stars, setStars] = useState<{ x: number; y: number; opacity: number; duration: number; delay: number; scale: number }[]>([]);

    useEffect(() => {
        const starCount = 150; // Increased density
        const newStars = Array.from({ length: starCount }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: Math.random() * 0.7 + 0.3, // Higher base opacity
            duration: 1.5 + Math.random() * 2.5, // Slightly faster twinkle
            delay: Math.random() * 2,
            scale: Math.random() * 0.8 + 0.5 // Varied sizes
        }));
        setStars(newStars);
    }, []);

    return (
        <>
            {stars.map((star, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full shadow-[0_0_3px_rgba(255,255,255,0.9)]"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: Math.random() > 0.8 ? '3px' : '2px', // Some larger stars
                        height: Math.random() > 0.8 ? '3px' : '2px',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [star.opacity, 1, star.opacity],
                        scale: [star.scale, star.scale * 1.3, star.scale]
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
    // 1. Visible Particles (Pollen/Dust)
    // 2. Slow moving decorative Birds
    const [particles, setParticles] = useState<{ x: number; y: number; size: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        const count = 50;
        const newParticles = Array.from({ length: count }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2, // Larger particles (2-6px)
            duration: 15 + Math.random() * 15,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    return (
        <>
            {/* Soft Background Blobs for depth */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-indigo-200/10 rounded-full blur-[120px]" />

            {/* Visible Floating Particles (Golden/Slate mix for mountain sun contrast) */}
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-slate-400/40" // Darker color to be visible on white
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                    }}
                    animate={{
                        y: [0, -120],
                        x: [0, Math.random() * 40 - 20],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay
                    }}
                />
            ))}

            {/* Silhouette Birds */}
            <BirdAnimation duration={25} delay={0} top={15} scale={0.6} />
            <BirdAnimation duration={30} delay={12} top={40} scale={0.4} />
            <BirdAnimation duration={22} delay={5} top={25} scale={0.5} />
        </>
    );
}

function BirdAnimation({ duration, delay, top, scale }: { duration: number, delay: number, top: number, scale: number }) {
    return (
        <motion.div
            className="absolute left-[-50px] text-slate-300 dark:hidden"
            style={{ top: `${top}%` }}
            animate={{
                x: ['-10vw', '110vw'],
                y: [0, -30, 0, 20] // Wavy flight path
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay
            }}
        >
            <div style={{ transform: `scale(${scale})` }}>
                <svg width="40" height="30" viewBox="0 0 40 30" fill="currentColor" className="opacity-60">
                    <path d="M0 15 Q 10 0 20 15 Q 30 0 40 15" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
            </div>
        </motion.div>
    );
}
