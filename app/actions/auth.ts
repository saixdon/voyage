"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { WelcomeEmail } from "@/emails/welcome-email";

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
        return { success: true, session: data.session };
    }

    return { success: true };
}

export async function signUpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("name") as string | null;

    const supabase = getSupabaseAdmin();

    // Create user - Supabase will auto-confirm since we're using service role
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName || "",
            }
        }
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: "Benutzer konnte nicht erstellt werden." };

    // Set cookie immediately - no email confirmation required
    const cookieStore = await cookies();
    if (data.session) {
        cookieStore.set("sb-auth-token", data.session.access_token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
        });

        // Send welcome email in background (don't block)
        sendEmail({
            to: email,
            subject: "Welcome to TripVega! 🌍",
            react: WelcomeEmail({ name: fullName || email.split('@')[0] })
        }).catch(err => console.error("Failed to send welcome email:", err));

        return { success: true, session: data.session };
    }

    // Fallback: If no session returned, user might need to login manually
    return {
        success: true,
        message: "Account erstellt. Bitte logge dich ein."
    };
}

export async function signOutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("sb-auth-token");
    return { success: true };
}

export async function updateProfileAction(formData: FormData) {
    const name = formData.get("name") as string;

    const cookieStore = await cookies();
    const token = cookieStore.get("sb-auth-token")?.value;

    if (!token) return { error: "Unauthorized" };

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
        return { error: "Unauthorized" };
    }

    const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/account/settings");
    return { success: true };
}
