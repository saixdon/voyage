"use client";

import React from "react";
import GlobeDestinations from "@/components/features/GlobeDestinations";
import { TopListsSection } from "@/components/features/TopListsSection";

export default function DestinationsPage() {
    return (
        <main className="min-h-screen pt-20 bg-[#050505]">
            <GlobeDestinations />
            <TopListsSection />
        </main>
    );
}
