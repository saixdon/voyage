import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
    return createClient(supabaseUrl, supabaseServiceKey);
}

async function getUserFromRequest() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("sb-auth-token");
    if (!authCookie) return null;

    const supabase = getSupabaseAdmin();
    const { data } = await supabase.auth.getUser(authCookie.value);
    return data?.user || null;
}

// GET /api/trips/[tripId] - Get single trip with items
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tripId: string }> }
) {
    try {
        const { tripId } = await params;
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = getSupabaseAdmin();

        const { data: trip, error } = await supabase
            .from("trips")
            .select(`
                *,
                items:trip_items(*)
            `)
            .eq("id", tripId)
            .eq("user_id", user.id)
            .single();

        if (error || !trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        return NextResponse.json(trip);
    } catch (error) {
        console.error("Error in GET /api/trips/[tripId]:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE /api/trips/[tripId] - Delete a trip
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ tripId: string }> }
) {
    try {
        const { tripId } = await params;
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = getSupabaseAdmin();

        // Delete items first (or use cascade)
        await supabase
            .from("trip_items")
            .delete()
            .eq("trip_id", tripId);

        // Delete trip
        const { error } = await supabase
            .from("trips")
            .delete()
            .eq("id", tripId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error deleting trip:", error);
            return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in DELETE /api/trips/[tripId]:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
