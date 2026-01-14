"use client";

import React from "react";
import { SearchBar } from "@/components/features/SearchBar";

export default function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <div className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background-dark z-10"></div>
                    <img
                        alt="Scenic view of mountains and lake with a boat in Switzerland"
                        className="w-full h-full object-cover animate-pulse-slow scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0AW3APbVwOee6PwlmX8IpBMcXKtCgtA7UlIFcqL76PvrCD0izW208xf8s8uqzedqkSFtuscogmTX9xhXom3Cv-_gQNUxT9Nq8K5egTteA9EbV-1e0gMTx6Ty9l_pkD4ucf0pIcFQtvanzSOElU9qbHNpVN4VPEk-pJ-ShxYsoqMi33bWmCM-HRfhVHYQI2Fu1jIjtpvG0m5oMnZ6dNGhs5qF5pQggig-tLOkrNgkxOfHr1cu-gEz1fn0FRpMujWDe1_w-zWbbfTvc"
                    />
                </div>
                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center max-w-4xl px-4 text-center mt-10">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-none mb-6 text-glow opacity-0 animate-fade-in-up">
                        DISCOVER THE
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">
                            UNSEEN
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-10 opacity-0 animate-fade-in-up-delay-1 font-light">
                        Unforgettable experiences at your fingertips. Book tours,
                        activities, and attractions anywhere in the world.
                    </p>
                    {/* Search Bar */}
                    <div className="w-full mt-4 flex justify-center opacity-0 animate-fade-in-up-delay-2">
                        <SearchBar />
                    </div>
                    {/* Quick Stats/Trust */}
                    <div className="mt-12 flex gap-8 md:gap-16 opacity-0 animate-fade-in-up-delay-2">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">50K+</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                Experiences
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">160+</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                Countries
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">4.8/5</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                User Rating
                            </p>
                        </div>
                    </div>
                </div>
                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-70">
                    <span className="material-symbols-outlined text-white text-3xl">
                        keyboard_arrow_down
                    </span>
                </div>
            </div>

            {/* Main Content Container */}
            <main className="max-w-7xl mx-auto px-6 py-20">
                {/* Categories / Chips */}
                <section className="mb-20">
                    <h3 className="text-white/60 text-sm font-medium uppercase tracking-widest mb-6">
                        Browse by Category
                    </h3>
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                        <a
                            className="flex shrink-0 items-center gap-3 h-14 px-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 hover:bg-card-hover transition-all duration-300 group"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                                restaurant
                            </span>
                            <span className="text-white font-medium whitespace-nowrap">
                                Food &amp; Drink
                            </span>
                        </a>
                        <a
                            className="flex shrink-0 items-center gap-3 h-14 px-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 hover:bg-card-hover transition-all duration-300 group"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                                sports_basketball
                            </span>
                            <span className="text-white font-medium whitespace-nowrap">
                                Sports
                            </span>
                        </a>
                        <a
                            className="flex shrink-0 items-center gap-3 h-14 px-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 hover:bg-card-hover transition-all duration-300 group"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                                museum
                            </span>
                            <span className="text-white font-medium whitespace-nowrap">
                                Culture
                            </span>
                        </a>
                        <a
                            className="flex shrink-0 items-center gap-3 h-14 px-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 hover:bg-card-hover transition-all duration-300 group"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                                landscape
                            </span>
                            <span className="text-white font-medium whitespace-nowrap">
                                Nature
                            </span>
                        </a>
                        <a
                            className="flex shrink-0 items-center gap-3 h-14 px-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 hover:bg-card-hover transition-all duration-300 group"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                                hiking
                            </span>
                            <span className="text-white font-medium whitespace-nowrap">
                                Adventures
                            </span>
                        </a>
                        <a
                            className="flex shrink-0 items-center gap-3 h-14 px-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 hover:bg-card-hover transition-all duration-300 group"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                                sailing
                            </span>
                            <span className="text-white font-medium whitespace-nowrap">
                                Water Activities
                            </span>
                        </a>
                    </div>
                </section>

                {/* Trending Destinations */}
                <section className="mb-24">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Trending Destinations
                            </h2>
                            <p className="text-gray-400">
                                Most popular places traveled by our community
                            </p>
                        </div>
                        <a
                            className="hidden md:flex items-center gap-1 text-primary hover:text-white transition-colors font-medium group"
                            href="#"
                        >
                            View all
                            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                                arrow_forward
                            </span>
                        </a>
                    </div>
                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Large Card - Rome */}
                        <div className="relative md:col-span-2 md:row-span-2 group overflow-hidden rounded-3xl cursor-pointer">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                            <img
                                alt="Ancient Roman architecture in Rome, Italy during sunset"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1AjHuGxBbevjUBWBcJQ5CyII45U8ouI_ZNeOFKGpbDo1JbzLhJ8EMGdcdMhgwfFSOwKVKx6A4FggkIy0KLL2upxmYjdKEtFMtpdmAlps3yfLY7Awy2yDEoXXMNABWE8aaX6w9qAo6EAHARA3lrUVCqU-52pK8D3In6jnbFB7AOqUBlGwcoBJaZPVXoxe0OB5ES-vdEvrUOzLfCxPnvsAKnadPR5heVQfo2eK2ihEXw7R6D0JT29d9BkVJaBCJOMXGdGL9Glkdue8T"
                            />
                            <div className="absolute bottom-0 left-0 p-8 z-30 w-full">
                                <div className="flex justify-between items-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <div>
                                        <h3 className="text-4xl font-bold text-white mb-2">Rome</h3>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <span className="material-symbols-outlined text-primary text-sm">
                                                location_on
                                            </span>
                                            <span>Italy</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20">
                                            1,240 Tours
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Tall Card - Paris */}
                        <div className="relative md:col-span-1 md:row-span-2 group overflow-hidden rounded-3xl cursor-pointer">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                            <img
                                alt="Eiffel Tower view from a street in Paris, France"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA42_x_NJKZ3NPmOSGnKRtxxxlKjqPR1lM6r4_yv8FBoQFXEI32ij0Ge15c3fL0lmob4utP6JsYuKESTPuwdxwLL7UmESH0_c-nqXobs71zaCQ6XmcfSHe2ySOV8DgSpBZa2PNQ8ZF6hkMK0szLUVFEQFk7Gx8E6TfK4m3fx5yC59QnQDsqblLdyXNsEIDP2YDTRoih3KqhbJFrQDIAFaLx3XFsCn8kudL4uEMr3iIETY54zoimjtDwFv9FxKLYO9mu6R6L5vXthByb"
                            />
                            <div className="absolute bottom-0 left-0 p-6 z-30 w-full">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-3xl font-bold text-white mb-1">Paris</h3>
                                    <div className="flex items-center gap-2 text-gray-300 mb-4">
                                        <span className="material-symbols-outlined text-primary text-sm">
                                            location_on
                                        </span>
                                        <span>France</span>
                                    </div>
                                    <span className="inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-sm text-primary font-medium">
                                        Discover 850+ activities
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Regular Card - Barcelona */}
                        <div className="relative group overflow-hidden rounded-3xl cursor-pointer">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                            <img
                                alt="Colorful architecture and streets in Barcelona, Spain"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUMn1vzToK6c-BU8uLhEmxpQSo_XWFd6Y8vfNF-Jm4vjsTEOSzWXh6FSh1AtynHOiPqYnSP_5v9q9YCotgxaXfNJHpSHUC3RtoCnw9uJ_V-tWz4FEJHCb79wkn0eAs-ZlaTiyxo1faQRZN0mn2KEswOLfoRarkJUllq6f0FBxz6BVQwOKUEsjInfIQL0OQGsdp1JRJ2G4orT4QMF5wYojUJlgrlhYxgnBKRE3oeO1Tb07Q9saXQe9OBcJhUVnW2A0WOZRP8NO5LKHQ"
                            />
                            <div className="absolute bottom-0 left-0 p-6 z-30 w-full">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-2xl font-bold text-white">Barcelona</h3>
                                    <p className="text-gray-300 text-sm">Spain</p>
                                </div>
                            </div>
                        </div>
                        {/* Regular Card - New York */}
                        <div className="relative group overflow-hidden rounded-3xl cursor-pointer md:col-span-2">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                            <img
                                alt="Skyline of New York City, USA during daytime"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1qfrwqE84IJy1QbWT2hUAjBIxKI4BU1cSjYurt1uCo0nQVpEuAwOC_1YEE6KVJ-KYTDQp2XGp30_TU1Yy_gFKbRO1vDNu6-eWABTWL2ZmJ59OehHK61ni7noNJgf5xyWSLSVqCgBEGuo-h0YMs6iLfWfxkV_gk23Gbegv59zTrji4envRdpB8zEGhjeci0H-YLUhgAluO0wFK1VP2VShLduLeZSlqmCcY_IKv3QWF8tEtnqWPHQ5pkq26LocnSovB1KdhL_79Q7Z1"
                            />
                            <div className="absolute bottom-0 left-0 p-6 z-30 w-full flex justify-between items-end">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-2xl font-bold text-white">New York</h3>
                                    <p className="text-gray-300 text-sm">USA</p>
                                </div>
                                <div className="transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                    <span className="material-symbols-outlined text-white bg-primary p-2 rounded-full">
                                        arrow_forward
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top Experiences Carousel */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-white">
                            Top Rated Experiences
                        </h2>
                        <div className="flex gap-2">
                            <button className="size-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white">
                                    arrow_back
                                </span>
                            </button>
                            <button className="size-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                                <span className="material-symbols-outlined text-white">
                                    arrow_forward
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-10 snap-x snap-mandatory">
                        {/* Card 1 - Colosseum */}
                        <div className="min-w-[300px] md:min-w-[340px] snap-center group">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-4">
                                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 z-20">
                                    Bestseller
                                </div>
                                <div className="absolute top-3 right-3 bg-white text-black p-1.5 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-sm block">
                                        favorite
                                    </span>
                                </div>
                                <img
                                    alt="Interior view of the Colosseum in Rome"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIrYgUY-fL88EexfBUukYoEscAoH9BnoFAhxe3dYuaD1oXUFSwMA-qtonVaaph38VtFX0vc3kL-9fdjG6C1vpyearFZWGObvPA11cJ0fKF1sassvtOHZ3pLdnjrVgBtI6ZlN9ll6B-45wXl1nt330OJXjwHZ06H7TomXp30lOtnbdCoB7QULkcs-dA1L6FrRPCIaKGFJp36ISnvh6iLBj55O129jDWdXxytyLz6UuG-NiQol8q-zcqS9libTwB9dwH5jKfyPXH4GR5"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star_half
                                    </span>
                                    <span className="text-gray-400 ml-1 text-xs">(3,204)</span>
                                </div>
                                <h3 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                    Colosseum, Roman Forum &amp; Palatine Hill Priority Access
                                </h3>
                                <p className="text-gray-400 text-sm">Guided Tour • 3 hours</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-white font-bold">From €55</span>
                                    <span className="text-gray-500 text-xs line-through">
                                        €65
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Card 2 - Louvre */}
                        <div className="min-w-[300px] md:min-w-[340px] snap-center group">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-4">
                                <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 z-20">
                                    Likely to sell out
                                </div>
                                <img
                                    alt="Inside view of the Louvre Museum in Paris"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrtnm7-DMa2PT8F8CRvd_8LX-vGGsnCTwu6jTIFEckGgUeaZJkFhF_ztgqKDifr2Jw2PwU4taH2bV5g66F3Ip4qALkRqBRPrGyNftf5dtm7dKwW3Qk_i1lq0LS8bokuheh2bgBuxuc4k9nPFDKiK8VdzjxJW2N1Bzn7OG7030gxNvC2vxLpkR6OaIdsbwmkpRQoIeq6YrsRCnbg59v8lSOVFr6rf6XoWHpDA3ncS042DjW_sEFfb4C-w-34HOc-H2cHjWkyotKXcTA"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="text-gray-400 ml-1 text-xs">(12,450)</span>
                                </div>
                                <h3 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                    Louvre Museum Timed-Entrance Ticket
                                </h3>
                                <p className="text-gray-400 text-sm">Entry Ticket • Valid 1 day</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-white font-bold">From €17</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 3 - Great Barrier Reef */}
                        <div className="min-w-[300px] md:min-w-[340px] snap-center group">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-4">
                                <img
                                    alt="Diving underwater in the Great Barrier Reef"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjrh4KBJEBKf9klt3hQWbEYdAGL-DnKofGS4Vnb-NJjr_BGu3CfoOaSZBsu_B2jT43XZomRwzX6Z5uLW4nNo6ZzXV1_kIhfaNBKdC8f9sw8RvVrudRHKd-5qZA4dt7-5_FZawXFkgZgRm3eJNiUGMUPbwx5ztREjuM61mzp4x9tuUVzC6VWXqFWM9yLC6Jsobw0H1IJYhzCy-J5OnEWKweBdEq_7Ze3hspxxZWix6GLJodkSy60OuzZXqjf3IGMxJInM-dm7qpCFbh"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star_border
                                    </span>
                                    <span className="text-gray-400 ml-1 text-xs">(890)</span>
                                </div>
                                <h3 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                    Great Barrier Reef Snorkeling &amp; Diving Cruise
                                </h3>
                                <p className="text-gray-400 text-sm">Water Activity • 8 hours</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-white font-bold">From €140</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 4 - Burj Khalifa */}
                        <div className="min-w-[300px] md:min-w-[340px] snap-center group">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-4">
                                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 z-20">
                                    Top Pick
                                </div>
                                <img
                                    alt="Burj Khalifa in Dubai towering over the city"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNfzJXVoFe9sOJSrghYNPD8ayZf79nvElA6P3n2Lb8O6W6VGjdzO4H86-lvrrpgLNKxuhKpF2rcPc0YRvgM7HBqKJaESP1KJGm_1fzPADVPF-UjN9pcHV_5VWidJ1q1GI-zxkZoOIvIP8BcAGwUU1gmxb2L-xhQhsTVQjFZFZUkNvQ-IqPeTrJCLZ-uiDXXckor3XIKqVP8GrEuyPQ6-E5REjg7qRX_CvpgW9hi_qGWT_Oc-RpntocOyWkzIgVrG9dt4dZTD_1B3PH"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="material-symbols-outlined text-base">
                                        star
                                    </span>
                                    <span className="text-gray-400 ml-1 text-xs">(15k+)</span>
                                </div>
                                <h3 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                    Dubai: Burj Khalifa Level 124 &amp; 125 Entry Ticket
                                </h3>
                                <p className="text-gray-400 text-sm">Entry Ticket • 1.5 hours</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-white font-bold">From €45</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter / CTA Section */}
                <section className="relative rounded-3xl overflow-hidden bg-card-dark border border-white/5 py-16 px-6 md:px-20 text-center">
                    {/* Abstract background blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">
                                mail
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Your travel journey starts here
                        </h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Sign up to receive travel inspiration, exclusive offers, and tips
                            for your next adventure.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3">
                            <input
                                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="Your email address"
                                type="email"
                            />
                            <button
                                className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(43,140,238,0.3)] hover:shadow-[0_0_30px_rgba(43,140,238,0.5)] transition-all transform hover:scale-105"
                                type="button"
                            >
                                Subscribe
                            </button>
                        </form>
                        <p className="text-gray-500 text-xs mt-4">
                            By signing up, you agree to receive promotional emails. You can
                            unsubscribe at any time.
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-background-dark border-t border-white/5 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="size-6 text-white">
                                    <svg
                                        className="w-full h-full"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            clipRule="evenodd"
                                            d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                                            fill="currentColor"
                                            fillRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-white font-bold text-lg">
                                    GetYourGuide
                                </span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Company</h4>
                            <ul className="space-y-3 text-gray-400 text-sm">
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Press
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Magazine
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Support</h4>
                            <ul className="space-y-3 text-gray-400 text-sm">
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Legal Notice
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Work with us</h4>
                            <ul className="space-y-3 text-gray-400 text-sm">
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Supply Administration
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Become a Supplier
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Become an Affiliate
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">
                            © 2024 GetYourGuide. Made for explorers.
                        </p>
                        <div className="flex gap-4">
                            <a
                                className="text-gray-400 hover:text-white transition-colors"
                                href="#"
                            >
                                <svg
                                    aria-hidden="true"
                                    className="size-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        clipRule="evenodd"
                                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </a>
                            <a
                                className="text-gray-400 hover:text-white transition-colors"
                                href="#"
                            >
                                <svg
                                    aria-hidden="true"
                                    className="size-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        clipRule="evenodd"
                                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 3.808-.06zm0 1.838c-2.587 0-2.898.01-3.924.056-.969.045-1.503.204-1.855.341-.47.182-.806.398-1.15.742-.344.344-.56.68-.742 1.15-.137.352-.296.886-.341 1.855-.046 1.026-.056 1.337-.056 3.924s.01 2.898.056 3.924c.045.969.204 1.503.341 1.855.182.47.398.806.742 1.15.344.344.68.56 1.15.742.352.137.886.296 1.855.341 1.026.046 1.337.056 3.924.056s2.898-.01 3.924-.056c.969-.045 1.503-.204 1.855-.341.47-.182.806-.398 1.15-.742.344-.344.56-.68.742-1.15.137-.352.296-.886.341-1.855.046-1.026.056-1.337.056-3.924s-.01-2.898-.056-3.924c-.045-.969-.204-1.503-.341-1.855-.182-.47-.398-.806-.742-1.15-.344-.344-.68-.56-1.15-.742-.352-.137-.886-.296-1.855-.341-1.026-.046-1.337-.056-3.924-.056z"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
