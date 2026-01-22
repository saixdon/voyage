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
            <div className="block dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50/50 via-white to-white">
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
    const [particles, setParticles] = useState<{ x: number; y: number; size: number; duration: number; delay: number; color: string }[]>([]);
    const [birds, setBirds] = useState<{ top: number; delay: number; duration: number; scale: number; startX: string }[]>([]);

    useEffect(() => {
        // 1. More Particles (150) & Colorful
        const particleCount = 150;
        const colors = [
            "bg-amber-400/40",
            "bg-sky-400/40",
            "bg-rose-400/40",
            "bg-emerald-400/40",
            "bg-slate-500/30"
        ];

        const newParticles = Array.from({ length: particleCount }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 6 + 2, // 2-8px
            duration: 10 + Math.random() * 15,
            delay: Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
        setParticles(newParticles);

        // 2. More Birds (25)
        const birdCount = 25;
        const newBirds = Array.from({ length: birdCount }).map(() => ({
            top: Math.random() * 90 + 5, // Spread across 5%-95% height
            delay: Math.random() * 40,   // Staggered starts up to 40s
            duration: 25 + Math.random() * 20, // Slow gliding
            scale: Math.random() * 0.4 + 0.3, // Varied sizes
            startX: Math.random() > 0.5 ? '-10vw' : '110vw' // Some fly left-to-right, some right-to-left?? actually let's keep consistent direction for now or handle logic below
        }));
        setBirds(newBirds);

    }, []);

    return (
        <>
            {/* Vibrant Background Blobs */}
            <div className="absolute top-[5%] left-[10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply" />
            <div className="absolute top-[40%] right-[5%] w-[700px] h-[700px] bg-indigo-200/30 rounded-full blur-[150px] mix-blend-multiply" />
            <div className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[130px] mix-blend-multiply" />
            <div className="absolute top-[20%] right-[30%] w-[400px] h-[400px] bg-rose-100/40 rounded-full blur-[100px] mix-blend-multiply" />

            {/* Colorful Floating Particles */}
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full ${p.color}`}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                    }}
                    animate={{
                        y: [0, -100],
                        x: [0, Math.random() * 40 - 20],
                        opacity: [0, 0.8, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay
                    }}
                />
            ))}

            {/* Flock of Birds */}
            {birds.map((bird, i) => (
                <BirdAnimation
                    key={i}
                    duration={bird.duration}
                    delay={bird.delay}
                    top={bird.top}
                    scale={bird.scale}
                />
            ))}
        </>
    );
}

function BirdAnimation({ duration, delay, top, scale }: { duration: number, delay: number, top: number, scale: number }) {
    return (
        <motion.div
            className="absolute left-[-100px] text-slate-700/60 dark:hidden"
            style={{ top: `${top}%` }}
            initial={{ x: '-10vw' }}
            animate={{
                x: ['-10vw', '110vw'],
                y: [0, -30, 10, -15] // Gentle waving
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay
            }}
        >
            <div style={{ transform: `scale(${scale}) rotate(10deg)` }}>
                <svg width="40" height="30" viewBox="0 0 50 40" fill="currentColor">
                    <path d="M5 20 Q 20 5 35 20 Q 20 15 5 20" />
                    <path d="M35 20 Q 42 15 48 20 Q 42 22 35 20" />
                </svg>
            </div>
        </motion.div>
    );
}
