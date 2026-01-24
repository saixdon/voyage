import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './lib/i18n/config';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
    // 1. Create the next-intl middleware
    const intlMiddleware = createMiddleware({
        locales,
        defaultLocale: 'en',
        localePrefix
    });

    // 2. Get the response from intlMiddleware
    const response = intlMiddleware(request);

    // 3. Create a Supabase client that uses the response to set cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // 4. This will refresh the session if it's expired
    // Required for Server Components and Route Handlers to see a valid session
    await supabase.auth.getUser();

    return response;
}

export const config = {
    matcher: [
        // Skip Next.js internals, API routes, auth routes, and all static files
        '/((?!api|auth|_next|[^?]*\\.(?:html?|css|js(?!|son)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
