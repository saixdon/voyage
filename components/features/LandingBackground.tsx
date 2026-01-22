"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LandingBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
            {/* Dark Mode: Brighter, Faster Stars */}
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black">
                <NightStars />
            </div>

            {/* Light Mode: Vibrant Travel Theme (Ferris Wheel, Balloons, Sun) */}
            <div className="block dark:hidden absolute inset-0 bg-gradient-to-b from-sky-400/30 via-sky-200/30 to-amber-100/40">
                <DayTravelScene />
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

function DayTravelScene() {
    // Generate random clouds
    const [clouds, setClouds] = useState<{ x: number; y: number; scale: number; speed: number }[]>([]);

    useEffect(() => {
        setClouds(Array.from({ length: 6 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 60,
            scale: Math.random() * 0.8 + 1.2,
            speed: Math.random() * 20 + 40
        })));
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Sun Rays - Rotating */}
            <SunRays />

            {/* Clouds */}
            {clouds.map((cloud, i) => (
                <motion.div
                    key={i}
                    className="absolute text-white/50 blur-2xl"
                    style={{ top: `${cloud.y}%`, transform: `scale(${cloud.scale})` }}
                    initial={{ left: `${cloud.x}%` }}
                    animate={{ left: ['100%', '-20%'] }}
                    transition={{ duration: cloud.speed, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-96 h-32 bg-current rounded-full" />
                </motion.div>
            ))}

            {/* Huge Ferris Wheel - Anchored Bottom Right */}
            <div className="absolute bottom-[-15%] right-[-150px] md:right-[-250px] opacity-90 mix-blend-multiply z-10 w-[600px] h-[600px] md:w-[900px] md:h-[900px]">
                <FerrisWheel />
            </div>

            {/* Massive Hot Air Balloons */}
            <HotAirBalloon color1="#ef4444" color2="#ffffff" size={200} startX={5} speed={55} delay={0} />
            <HotAirBalloon color1="#3b82f6" color2="#fcd34d" size={160} startX={80} speed={70} delay={8} />
            <HotAirBalloon color1="#10b981" color2="#ffffff" size={140} startX={25} speed={65} delay={15} />

            {/* Big Distinct Birds */}
            <BirdAnimation duration={25} delay={0} top={25} scale={2.5} />
            <BirdAnimation duration={30} delay={12} top={45} scale={2.0} />
            <BirdAnimation duration={22} delay={5} top={15} scale={3.0} />
            <BirdAnimation duration={28} delay={18} top={60} scale={2.2} />
        </div>
    );
}

function SunRays() {
    return (
        <motion.div
            className="absolute -top-[50%] -left-[20%] w-[150vw] h-[150vw] opacity-30 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
            <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_20deg,#fbbf24_30deg,transparent_40deg,transparent_60deg,#fbbf24_70deg,transparent_80deg,transparent_100deg,#fbbf24_110deg,transparent_120deg)] blur-3xl" />
        </motion.div>
    );
}

function HotAirBalloon({ color1, color2, size, startX, speed, delay }: { color1: string, color2: string, size: number, startX: number, speed: number, delay: number }) {
    return (
        <motion.div
            className="absolute z-0"
            initial={{ y: '110vh', x: `${startX}vw` }}
            animate={{
                y: '-40vh',
                x: [`${startX}vw`, `${startX + 10}vw`]
            }}
            transition={{
                y: { duration: speed, repeat: Infinity, ease: "linear", delay: delay },
                x: { duration: speed, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }
            }}
        >
            <svg width={size} height={size * 1.3} viewBox="0 0 100 130" fill="none">
                {/* Balloon Body */}
                <path d="M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100Z" fill={color1} />
                <path d="M50 0V100" stroke={color2} strokeWidth="3" />
                <path d="M15 15C15 15 35 35 35 100" stroke={color2} strokeWidth="3" fill="none" />
                <path d="M85 15C85 15 65 35 65 100" stroke={color2} strokeWidth="3" fill="none" />

                {/* Stripes */}
                <path d="M0 50H100" stroke={color2} strokeWidth="3" opacity="0.4" />

                {/* Ropes */}
                <path d="M30 95L40 120" stroke="#444" strokeWidth="2" />
                <path d="M70 95L60 120" stroke="#444" strokeWidth="2" />

                {/* Basket */}
                <rect x="35" y="120" width="30" height="15" fill="#78350f" rx="3" />
            </svg>
        </motion.div>
    );
}

function FerrisWheel() {
    return (
        <div className="relative w-full h-full">
            {/* Stand */}
            <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M50 50L20 100H80L50 50Z" fill="none" stroke="#475569" strokeWidth="3" />
            </svg>

            {/* Wheel */}
            <motion.div
                className="w-full h-full origin-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
                <svg width="100%" height="100%" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#475569" strokeWidth="4" />
                    <circle cx="100" cy="100" r="10" fill="#fbbf24" />

                    {/* Spokes */}
                    {[...Array(16)].map((_, i) => (
                        <line
                            key={i}
                            x1="100" y1="100"
                            x2={100 + 90 * Math.cos((i * 22.5 * Math.PI) / 180)}
                            y2={100 + 90 * Math.sin((i * 22.5 * Math.PI) / 180)}
                            stroke="#64748b" strokeWidth="2"
                        />
                    ))}

                    {/* Cabins */}
                    {[...Array(16)].map((_, i) => (
                        <g key={i} transform={`translate(${100 + 90 * Math.cos((i * 22.5 * Math.PI) / 180)}, ${100 + 90 * Math.sin((i * 22.5 * Math.PI) / 180)})`}>
                            {/* Counter-rotate cabin to keep it upright */}
                            <motion.g animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
                                <circle r="6" fill={i % 2 === 0 ? "#ef4444" : "#3b82f6"} stroke="white" strokeWidth="1" />
                                <rect x="-3" y="-2" width="6" height="5" fill="white" rx="1" opacity="0.8" />
                            </motion.g>
                        </g>
                    ))}
                </svg>
            </motion.div>
        </div>
    );
}

function BirdAnimation({ duration, delay, top, scale }: { duration: number, delay: number, top: number, scale: number }) {
    return (
        <motion.div
            className="absolute left-[-150px] text-slate-900/80 dark:hidden drop-shadow-md z-20"
            style={{ top: `${top}%` }}
            initial={{ x: '-10vw' }}
            animate={{
                x: ['-10vw', '110vw'],
                y: [0, -50, 20, -40]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay
            }}
        >
            <div style={{ transform: `scale(${scale}) rotate(5deg)` }}>
                {/* Even clear, sharper bird SVG */}
                <svg width="60" height="50" viewBox="0 0 60 50" fill="currentColor">
                    <path d="M5 25 C 20 5, 30 5, 35 25 C 25 20, 15 20, 5 25 Z" />
                    <path d="M35 25 C 50 15, 60 15, 55 30 C 50 25, 40 25, 35 25 Z" />
                </svg>
            </div>
        </motion.div>
    );
}
