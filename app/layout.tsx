import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Voyage - Discover the Unseen",
    description:
        "Premium experiences at your fingertips. Book tours, activities, and attractions anywhere in the world.",
};

import { Navbar } from "@/components/features/Navbar";

// import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // <ClerkProvider>
        <html lang="de" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden selection:bg-primary selection:text-white">
                <Navbar />
                {children}
            </body>
        </html>
        // </ClerkProvider>
    );
}
