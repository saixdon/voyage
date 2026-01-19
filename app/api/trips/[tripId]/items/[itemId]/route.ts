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

// PATCH /api/trips/[tripId]/items/[itemId] - Update item status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
    try {
        const { tripId, itemId } = await params;
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        if (!['proposed', 'pending', 'booked'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Verify trip belongs to user
        const { data: trip } = await supabase
            .from("trips")
            .select("id")
            .eq("id", tripId)
            .eq("user_id", user.id)
            .single();

        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        // Update item
        const updateData: any = { status };
        if (status === 'booked') {
            updateData.booked_at = new Date().toISOString();
        }

        const { data: item, error } = await supabase
            .from("trip_items")
            .update(updateData)
            .eq("id", itemId)
            .eq("trip_id", tripId)
            .select()
            .single();

        if (error) {
            console.error("Error updating item:", error);
            return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error("Error in PATCH /api/trips/[tripId]/items/[itemId]:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
