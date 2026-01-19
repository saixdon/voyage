
// Mock data for Viator API
import { ViatorTag } from './viator-client';

export const MOCK_DESTINATIONS = [
    { destinationId: 711, name: "Rome", type: "CITY", lookupId: "711", parentRef: "68" },
    { destinationId: 479, name: "Paris", type: "CITY", lookupId: "479", parentRef: "73" },
    { destinationId: 562, name: "Barcelona", type: "CITY", lookupId: "562", parentRef: "79" },
    { destinationId: 334, name: "Tokyo", type: "CITY", lookupId: "334", parentRef: "85" },
    { destinationId: 176, name: "Leipzig", type: "CITY", lookupId: "176", parentRef: "61" },
];

export const MOCK_PRODUCTS = [
    {
        productCode: "12345P1",
        title: "Berlin: TV Tower Fast View Ticket",
        description: "Skip the line and enjoy 360-degree views of Berlin from the TV Tower.",
        productUrl: "https://www.viator.com/tours/Berlin/TV-Tower/d488-12345P1",
        images: [{ variants: [{ url: "https://images.unsplash.com/photo-1560969184-10fe8719e654?auto=format&fit=crop&q=80&w=800", width: 800, height: 600 }] }],
        pricing: { summary: { fromPrice: 25.00 }, currency: "EUR" },
        reviews: { combinedAverageRating: 4.5, totalReviews: 1250 },
        duration: { fixedDurationInMinutes: 120 },
        destinations: [{ ref: "488", name: "Berlin" }],
        tags: [{ tagId: 21910, name: "Art and Culture" }],
    },
    {
        productCode: "12345P2",
        title: "Paris: Louvre Museum Timed Entrance Ticket",
        description: "Explore the world's most famous museum, home to the Mona Lisa.",
        productUrl: "https://www.viator.com/tours/Paris/Louvre/d479-12345P2",
        images: [{ variants: [{ url: "https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?auto=format&fit=crop&q=80&w=800", width: 800, height: 600 }] }],
        pricing: { summary: { fromPrice: 17.00 }, currency: "EUR" },
        reviews: { combinedAverageRating: 4.7, totalReviews: 8900 },
        duration: { fixedDurationInMinutes: 180 },
        destinations: [{ ref: "479", name: "Paris" }],
        tags: [{ tagId: 21910, name: "Art and Culture" }],
    },
    {
        productCode: "208481P2",
        title: "Leipzig: City Tour by Bus",
        description: "Discover Leipzig on a hop-on hop-off bus tour.",
        productUrl: "https://www.viator.com/tours/Leipzig/Bus-Tour/d176-208481P2",
        images: [{ variants: [{ url: "https://images.unsplash.com/photo-1574704812328-98e663806fb7?auto=format&fit=crop&q=80&w=800", width: 800, height: 600 }] }],
        pricing: { summary: { fromPrice: 20.00 }, currency: "EUR" },
        reviews: { combinedAverageRating: 4.2, totalReviews: 150 },
        duration: { fixedDurationInMinutes: 90 },
        destinations: [{ ref: "176", name: "Leipzig" }],
        tags: [{ tagId: 21911, name: "Food and Drink" }],
    }
];

export const MOCK_TAGS: ViatorTag[] = [
    { tagId: 21911, allNamesByLocale: { en: "Food and Drink", de: "Essen & Trinken" } },
    { tagId: 21909, allNamesByLocale: { en: "Outdoor Activities", de: "Outdoor-Aktivitäten" } },
    { tagId: 21910, allNamesByLocale: { en: "Art and Culture", de: "Kunst & Kultur" } },
];
