import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    try {
        const cookieStore = await cookies();
        const authCookie = cookieStore.get("sb-auth-token");

        if (!authCookie) {
            return NextResponse.json({ user: null });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data: { user }, error } = await supabase.auth.getUser(authCookie.value);

        if (error || !user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Auth Me Error:", error);
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
