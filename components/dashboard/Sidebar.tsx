"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";

export default function Sidebar() {
    const t = useTranslations("dashboard.navigation");
    const pathname = usePathname();

    const links = [
        { href: "/account", label: "dashboard", icon: "dashboard" },
        { href: "/account/bookings", label: "bookings", icon: "receipt_long" },
        { href: "/account/trips", label: "trips", icon: "map" },
        { href: "/account/favorites", label: "favorites", icon: "favorite" },
        { href: "/account/settings", label: "settings", icon: "settings" },
    ];

    return (
        <aside className="w-64 bg-surface border-r border-white/10 h-screen flex flex-col p-4">
            <div className="mb-8 px-4">
                <h2 className="text-xl font-bold text-foreground">TripVega</h2>
            </div>

            <nav className="flex-1 space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            <span className="material-symbols-outlined">{link.icon}</span>
                            {t(link.label)}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        U
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Test User</p>
                        <p className="text-xs text-muted-foreground">myAccount</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
