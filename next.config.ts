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
            {
                protocol: "https",
                hostname: "hare-media-cdn.tripadvisor.com",
            },
            {
                protocol: "https",
                hostname: "hare-dynamic-media-cdn.tripadvisor.com",
            },
        ],
    },

    // Content Security Policy for Viator Payment iFrame
    async headers() {
        // CSP directives for Viator Payment SDK
        const viatorFrameSrc = [
            "'self'",
            "https://api.tapayments.com",
            "https://api.staging.tapayments.com",
            "https://prod.accdab.net",
            "https://test.accdab.net",
            "https://www.cdn-net.com",
            "https://staging.cdn-net.com",
        ].join(" ");

        const viatorScriptSrc = [
            "'self'",
            "'unsafe-inline'", // Required for Next.js
            "'unsafe-eval'", // Required for Next.js dev mode
            "https://checkout-assets.payments.tamg.cloud",
            "https://prod.accdab.net",
            "https://test.accdab.net",
            "https://www.cdn-net.com",
            "https://staging.cdn-net.com",
            "https://six.cdn-net.com",
        ].join(" ");

        const viatorConnectSrc = [
            "'self'",
            "https://checkout-api.payments.tamg.cloud",
            "https://checkout-api-hare.payments-dev.tamg.cloud",
            "https://prod.accdab.net",
            "https://test.accdab.net",
            "https://api.tapayments.com",
            "https://api.staging.tapayments.com",
        ].join(" ");

        return [
            {
                // Apply CSP only to checkout pages
                source: "/:locale/checkout/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: `frame-src ${viatorFrameSrc}; script-src ${viatorScriptSrc}; connect-src ${viatorConnectSrc};`,
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
