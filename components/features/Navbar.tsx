"use client";

import React from "react";
import Link from "next/link";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-strong transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                    <div className="h-12 w-auto relative transition-transform duration-300 group-hover:scale-105">
                        <img
                            src="/brand/logo_transparent.png"
                            alt="TripVega"
                            className="h-full w-auto object-contain"
                        />
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        className="text-sm font-medium text-white/80 hover:text-primary transition-colors relative group"
                        href="/search"
                    >
                        Destinations
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link
                        className="text-sm font-medium text-white/80 hover:text-primary transition-colors relative group"
                        href="/search"
                    >
                        Activities
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link
                        className="text-sm font-medium text-white/80 hover:text-primary transition-colors relative group"
                        href="/search"
                    >
                        Culture
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </div>

                {/* Search Icon */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/search"
                        className="h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(43,140,238,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">search</span>
                        Explore
                    </Link>
                </div>
            </div>
        </nav>
    );
}
