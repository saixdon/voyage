import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    console.log("🔐 Auth Callback: Request received");
    console.log("🔐 Auth Callback: Full URL:", request.url);

    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log("🔐 Auth Callback: Cookies found:", allCookies.map(c => c.name).join(", "));

    if (!code) {
        console.error("🔐 Auth Callback: No code in URL!");
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {
                    // We'll set cookies manually on the response
                },
            },
        }
    );

    console.log("🔐 Auth Callback: Exchanging code for session...");

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("🔐 Auth Callback: Exchange ERROR:", error.message);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
    }

    if (!data.session) {
        console.error("🔐 Auth Callback: No session returned!");
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_session`);
    }

    console.log("🔐 Auth Callback: SUCCESS! User:", data.user?.email);
    console.log("🔐 Auth Callback: Session expires:", data.session.expires_at);

    // Create the redirect response
    const redirectUrl = `${origin}${next}`;
    console.log("🔐 Auth Callback: Redirecting to:", redirectUrl);
    const response = NextResponse.redirect(redirectUrl, { status: 302 });

    // Manually set the session cookies
    // The cookie name is based on the Supabase URL
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    const cookieName = `sb-${supabaseUrl.hostname.split('.')[0]}-auth-token`;

    // Create the session data to store in cookie
    const sessionData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
        user: data.session.user,
    };

    const sessionJson = JSON.stringify(sessionData);
    const base64Session = Buffer.from(sessionJson).toString('base64');

    console.log("🔐 Auth Callback: Session JSON length:", sessionJson.length);
    console.log("🔐 Auth Callback: Base64 length:", base64Session.length);

    // Cookie options
    const cookieOptions = {
        path: "/",
        sameSite: "lax" as const,
        httpOnly: false, // Client JS must be able to read this
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 400, // 400 days
    };

    // If the cookie is too large (>4096 bytes), we need to chunk it
    const maxChunkSize = 3500; // Leave room for cookie name and metadata

    if (base64Session.length <= maxChunkSize) {
        // Single cookie
        console.log("🔐 Auth Callback: Setting single cookie:", cookieName);
        response.cookies.set(cookieName, `base64-${base64Session}`, cookieOptions);
    } else {
        // Chunked cookies
        const chunks: string[] = [];
        for (let i = 0; i < base64Session.length; i += maxChunkSize) {
            chunks.push(base64Session.slice(i, i + maxChunkSize));
        }

        console.log("🔐 Auth Callback: Setting", chunks.length, "chunked cookies");

        for (let i = 0; i < chunks.length; i++) {
            const chunkName = `${cookieName}.${i}`;
            const chunkValue = i === 0 ? `base64-${chunks[i]}` : chunks[i];
            console.log("🔐 Auth Callback: Setting cookie:", chunkName, "length:", chunkValue.length);
            response.cookies.set(chunkName, chunkValue, cookieOptions);
        }
    }

    // Clear the code verifier cookie
    const verifierCookieName = `${cookieName}-code-verifier`;
    response.cookies.set(verifierCookieName, "", { ...cookieOptions, maxAge: 0 });
    console.log("🔐 Auth Callback: Cleared verifier cookie:", verifierCookieName);

    // Log final cookies
    const finalCookies = response.cookies.getAll();
    console.log("🔐 Auth Callback: Final response cookies:", finalCookies.map(c => c.name).join(", "));

    return response;
}
