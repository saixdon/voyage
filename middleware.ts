import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './lib/i18n/config';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
    // 1. Handle next-intl vs API routes
    // API routes should NOT be handled by next-intl, but still need Supabase auth
    let response: NextResponse;

    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
        response = NextResponse.next();
    } else {
        const intlMiddleware = createMiddleware({
            locales,
            defaultLocale: 'en',
            localePrefix
        });
        response = intlMiddleware(request);
    }

    // 2. Create a Supabase client that uses the response to set cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Safe set: if response is immutable or finalized, this might be tricky, 
                    // but usually works with NextResponse from intl or next()
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // 3. This will refresh the session if it's expired
    await supabase.auth.getUser();

    return response;
}

export const config = {
    matcher: [
        // Skip Next.js internals, auth routes, and all static files
        // We now INCLUDE /api routes so that Supabase session can be refreshed for API calls
        '/((?!auth|_next|[^?]*\\.(?:html?|css|js(?!|son)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
