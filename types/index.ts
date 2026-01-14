// TypeScript Type Definitions

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    birthDate?: string;
    profileImageUrl?: string;
    preferredLanguage: string;
    preferredCurrency: string;
    authProvider: "email" | "google" | "apple" | "facebook";
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
}

export interface Activity {
    id: string;
    title: string;
    location: string;
    image: string;
    images?: string[];
    price: number;
    currency: string;
    rating: number;
    reviewCount: number;
    duration: string;
    description?: string;
    highlights?: string[];
    included?: string[];
    notIncluded?: string[];
    meetingPoint?: string;
    languages?: string[];
    groupSize?: number;
    badge?: "bestseller" | "likely-to-sell-out" | "top-pick";
}

export interface Booking {
    id: string;
    userId: string;
    gygBookingReference: string;
    activityId: string;
    activityTitle: string;
    activityLocation?: string;
    activityImageUrl?: string;
    bookingDate: string;
    bookingTime?: string;
    participants: {
        adults: number;
        children: number;
        infants: number;
    };
    totalAmount: number;
    currency: string;
    status: "confirmed" | "pending" | "cancelled" | "completed";
    customerEmail: string;
    customerPhone?: string;
    specialRequirements?: string;
    voucherUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SavedActivity {
    id: string;
    userId: string;
    activityId: string;
    activityData: Activity;
    savedAt: string;
}

export interface SearchSuggestion {
    type: "location" | "activity" | "category" | "tour";
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
    icon: string;
}
