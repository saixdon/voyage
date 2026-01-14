import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal middleware - no authentication required
// GYG API endpoints use custom Basic Auth (see lib/auth/gyg-auth.ts)

export function middleware(request: NextRequest) {
    // Simply pass through all requests
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!|son)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
