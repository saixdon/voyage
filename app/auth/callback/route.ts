import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    console.log("🔐 Auth Callback: Request received");
    console.log("🔐 Auth Callback: Full URL:", request.url);
    console.log("🔐 Auth Callback: SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log("🔐 Auth Callback: Cookies found:", allCookies.map(c => c.name).join(", "));
    const verifierCookie = allCookies.find(c => c.name.includes("code-verifier"));
    console.log("🔐 Auth Callback: Verifier cookie present:", !!verifierCookie);

    console.log("🔐 Auth Callback: Code present:", !!code);
    console.log("🔐 Auth Callback: Code value:", code?.substring(0, 10) + "...");
    console.log("🔐 Auth Callback: Next param:", next);
    console.log("🔐 Auth Callback: Origin:", origin);

    if (code) {
        // Create response first - we'll set cookies on this response
        const response = NextResponse.redirect(`${origin}${next}`);

        try {
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    cookies: {
                        getAll() {
                            return cookieStore.getAll();
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                // Set cookies on the response object, not the request cookieStore
                                const cookieOptions: CookieOptions = {
                                    ...options,
                                    httpOnly: false, // Client JS must be able to read this
                                };
                                console.log("🔐 Setting cookie on response:", name, "options:", JSON.stringify(cookieOptions));
                                response.cookies.set(name, value, cookieOptions);
                            });
                        },
                    },
                }
            );

            console.log("🔐 Auth Callback: Supabase service client created, exchanging code...");

            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error("🔐 Auth Callback: Exchange ERROR:", error.message);
                console.error("🔐 Auth Callback: Error status:", error.status);
                console.error("🔐 Auth Callback: Full error:", JSON.stringify(error, null, 2));
                return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
            }

            console.log("🔐 Auth Callback: SUCCESS! User:", data.user?.email);
            console.log("🔐 Auth Callback: Session expires:", data.session?.expires_at);
            console.log("🔐 Auth Callback: Response cookies set:", response.cookies.getAll().map(c => c.name).join(", "));
            console.log("🔐 Auth Callback: Redirecting to:", `${origin}${next}`);

            return response;
        } catch (e: unknown) {
            const err = e as Error;
            console.error("🔐 Auth Callback: EXCEPTION:", err.message);
            console.error("🔐 Auth Callback: Stack:", err.stack);
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exception`);
        }
    } else {
        console.error("🔐 Auth Callback: No code in URL!");
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
