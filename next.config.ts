import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const nextConfig: NextConfig = {
    // Force rebuild timestamp: 2026-01-22
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "/aida-public/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "media.viator.com",
            },
            {
                protocol: "https",
                hostname: "media-cdn.tripadvisor.com",
            },
        ],
    },
};

export default withNextIntl(nextConfig);
