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

// GET /api/trips - Get all trips for user
export async function GET() {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = getSupabaseAdmin();

        const { data: trips, error } = await supabase
            .from("trips")
            .select(`
                *,
                items:trip_items(*)
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching trips:", error);
            return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
        }

        return NextResponse.json(trips);
    } catch (error) {
        console.error("Error in GET /api/trips:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { destination, summary, query, items } = body;

        const supabase = getSupabaseAdmin();

        // Create trip
        const { data: trip, error: tripError } = await supabase
            .from("trips")
            .insert({
                user_id: user.id,
                destination,
                summary,
                query
            })
            .select()
            .single();

        if (tripError) {
            console.error("Error creating trip:", tripError);
            return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
        }

        // Create trip items
        const tripItems = items.map((item: any) => ({
            trip_id: trip.id,
            activity_id: item.activity_id,
            day: item.day,
            time_of_day: item.time_of_day,
            title: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency,
            image: item.image,
            product_url: item.product_url,
            status: item.status || 'proposed'
        }));

        const { data: savedItems, error: itemsError } = await supabase
            .from("trip_items")
            .insert(tripItems)
            .select();

        if (itemsError) {
            console.error("Error creating trip items:", itemsError);
            // Rollback trip
            await supabase.from("trips").delete().eq("id", trip.id);
            return NextResponse.json({ error: "Failed to create trip items" }, { status: 500 });
        }

        return NextResponse.json({ ...trip, items: savedItems });
    } catch (error) {
        console.error("Error in POST /api/trips:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
