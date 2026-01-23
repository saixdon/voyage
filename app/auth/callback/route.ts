import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    console.log("🔐 Auth Callback: Request received");
    console.log("🔐 Auth Callback: Full URL:", request.url);

    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    console.log("🔐 Auth Callback: Code present:", !!code);
    console.log("🔐 Auth Callback: Next param:", next);
    console.log("🔐 Auth Callback: Origin:", origin);

    if (code) {
        const supabase = await createClient();
        console.log("🔐 Auth Callback: Exchanging code for session...");

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            console.log("🔐 Auth Callback: SUCCESS! User:", data.user?.email);
            console.log("🔐 Auth Callback: Redirecting to:", `${origin}${next}`);
            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error("🔐 Auth Callback: ERROR:", error.message);
            console.error("🔐 Auth Callback: Error details:", JSON.stringify(error));
        }
    } else {
        console.error("🔐 Auth Callback: No code in URL!");
    }

    console.error("🔐 Auth Callback: Redirecting to error page");
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
