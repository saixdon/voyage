"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LandingBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
            {/* Dark Mode: Stars */}
            <div className="hidden dark:block absolute inset-0">
                <NightStars />
            </div>

            {/* Light Mode: Mountain Air Particles */}
            <div className="block dark:hidden absolute inset-0">
                <DayParticles />
            </div>
        </div>
    );
}

function NightStars() {
    const [stars, setStars] = useState<{ x: number; y: number; opacity: number; duration: number; delay: number; scale: number }[]>([]);

    useEffect(() => {
        // Create stars distributed across the height
        const starCount = 60; // Not too many to avoid lag
        const newStars = Array.from({ length: starCount }).map(() => ({
            x: Math.random() * 100, // percentage
            y: Math.random() * 100, // percentage
            opacity: Math.random() * 0.5 + 0.3,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
            scale: Math.random() * 0.5 + 0.5
        }));
        setStars(newStars);
    }, []);

    return (
        <>
            {stars.map((star, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full shadow-[0_0_2px_rgba(255,255,255,0.8)]"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: '2px', // slightly larger fixed size
                        height: '2px',
                    }}
                    initial={{
                        opacity: star.opacity,
                        scale: star.scale
                    }}
                    animate={{
                        opacity: [star.opacity, 1, star.opacity],
                        scale: [star.scale, star.scale * 1.5, star.scale]
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

function DayParticles() {
    // Floating "pollen" or "dust" specks fitting for mountain air
    const [particles, setParticles] = useState<{ x: number; y: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        const count = 40;
        const newParticles = Array.from({ length: count }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: 10 + Math.random() * 10,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    return (
        <>
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-primary/20 backdrop-blur-sm"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: Math.random() > 0.5 ? '4px' : '6px',
                        height: Math.random() > 0.5 ? '4px' : '6px',
                    }}
                    animate={{
                        y: [0, -100], // Float upwards
                        x: [0, Math.random() * 20 - 10], // Slight horizontal drift
                        opacity: [0, 0.6, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay
                    }}
                />
            ))}
        </>
    );
}
