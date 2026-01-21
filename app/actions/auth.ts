import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

export async function signInAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return { error: error.message };

    const cookieStore = await cookies();
    if (data.session) {
        cookieStore.set("sb-auth-token", data.session.access_token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
    }

    return { success: true };
}

export async function signUpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) return { error: error.message };

    // If confirmation is disabled, we set cookie immediately
    const cookieStore = await cookies();
    if (data.session) {
        cookieStore.set("sb-auth-token", data.session.access_token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
        });
        return { success: true, session: true };
    }

    return { success: true, session: false };
}

export async function signOutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("sb-auth-token");
    return { success: true };
}
