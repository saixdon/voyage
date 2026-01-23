import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './lib/i18n/config';

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale: 'en',

    localePrefix
});

export const config = {
    matcher: [
        // Skip Next.js internals, API routes, auth routes, and all static files
        '/((?!api|auth|_next|[^?]*\\.(?:html?|css|js(?!|son)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
