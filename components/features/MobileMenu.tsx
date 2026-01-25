"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { X, ArrowRight, LogOut, User, Map, Car, Palmtree } from "lucide-react";
import { createPortal } from "react-dom";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const t = useTranslations('nav');
    const authT = useTranslations('auth');
    const { user, signOut } = useAuth();
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!mounted) return null;

    // Create portal to render at root level (avoids z-index issues)
    return createPortal(
        <div
            className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Backdrop / Scrim */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Menu Content - Side Drawer from Right */}
            <div
                className={`absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-surface border-l border-theme shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-theme">
                    <span className="text-xl font-bold tracking-tight text-foreground">{t('menu')}</span>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-elevated text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label={t('close')}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Links - Scrollable */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="flex flex-col px-4 gap-2">
                        {/* Primary Nav */}
                        <MobileLink href="/search?q=activities" onClick={onClose} icon={<Palmtree className="w-5 h-5" />}>
                            {t('activities')}
                        </MobileLink>
                        <MobileLink href="/search?q=transport" onClick={onClose} icon={<Car className="w-5 h-5" />}>
                            {t('transport')}
                        </MobileLink>
                        <MobileLink href="/search?q=culture" onClick={onClose} icon={<Map className="w-5 h-5" />}>
                            {t('culture')}
                        </MobileLink>

                        <div className="h-px bg-theme my-4 mx-2" />

                        {/* User Links */}
                        {user ? (
                            <>
                                <div className="px-4 py-2 text-sm text-muted-foreground font-medium">
                                    {user.email}
                                </div>
                                <MobileLink href="/dashboard/bookings" onClick={onClose} icon={<span className="material-symbols-outlined text-[20px]">confirmation_number</span>}>
                                    {t('bookings')}
                                </MobileLink>
                                <MobileLink href="/dashboard/trips" onClick={onClose} icon={<span className="material-symbols-outlined text-[20px]">travel_explore</span>}>
                                    {t('trips')}
                                </MobileLink>
                                <MobileLink href="/dashboard/favorites" onClick={onClose} icon={<span className="material-symbols-outlined text-[20px]">favorite</span>}>
                                    {t('favorites')}
                                </MobileLink>
                                <MobileLink href="/dashboard/settings" onClick={onClose} icon={<span className="material-symbols-outlined text-[20px]">settings</span>}>
                                    {t('settings')}
                                </MobileLink>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 text-primary font-medium active:bg-primary/20 transition-colors min-h-[56px]"
                            >
                                <User className="w-5 h-5" />
                                <span>{authT('signIn')}</span>
                                <ArrowRight className="w-5 h-5 ml-auto" />
                            </Link>
                        )}
                    </nav>
                </div>

                {/* Footer Actions */}
                {user && (
                    <div className="p-6 border-t border-theme bg-surface-elevated/50">
                        <button
                            onClick={() => { signOut(); onClose(); }}
                            className="flex items-center gap-3 w-full p-4 text-red-500 font-medium hover:bg-red-500/10 rounded-xl transition-colors min-h-[56px]"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('logout')}
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

// Helper specific link component for big touch targets
function MobileLink({ href, children, onClick, icon }: { href: string, children: React.ReactNode, onClick: () => void, icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-elevated text-foreground/90 font-medium active:scale-[0.98] transition-all min-h-[56px]"
        >
            <div className="text-muted-foreground">
                {icon}
            </div>
            {children}
        </Link>
    );
}
