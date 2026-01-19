import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase Client für Server-Side (Route Handlers) erstellen
// Wir nutzen hier createClient direkt, da wir im Route Handler sind
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper um den authentifizierten Client zu erhalten
async function getSupabaseClient(request: Request) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Auth Token aus Header extrahieren
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        // Wir setzen die Session NICHT manuell, da wir keine Cookies hier haben.
        // Stattdessen sollten wir eigentlich createServerClient von @supabase/ssr nutzen für Next.js
        // Aber für den ersten Schritt nutzen wir den Client mit dem übergebenen Access Token falls möglich
        // ODER wir verlassen uns darauf, dass der Client das Cookie sendet (Next.js Middleware)

        // VEREINFACHUNG: Wir nutzen hier eine einfachere Methode für den Client-Aufruf.
        // Die "richtige" Next.js App Router Methode braucht Cookies. 
        // Für diesen Route Handler nutzen wir den Service Role Key wäre zu gefährlich.
        // Wir nutzen den Anon Key und prüfen das User Objekt.
    }

    return supabase;
}

// BESSER: Wir nutzen createServerClient von einer Utility lib, wenn vorhanden
// Da wir das nicht haben, nutzen wir hier eine Standard-Implementierung für Route Handler
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function createClientServer() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function GET(request: Request) {
    const supabase = await createClientServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validierung
        if (!body.activity_id || !body.activity_title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('favorites')
            .insert({
                user_id: user.id,
                activity_id: body.activity_id,
                activity_title: body.activity_title,
                activity_image: body.activity_image,
                activity_location: body.activity_location,
                activity_price: body.activity_price,
                activity_currency: body.activity_currency,
                activity_rating: body.activity_rating,
                activity_review_count: body.activity_review_count,
                activity_duration: body.activity_duration
            })
            .select()
            .single();

        if (error) {
            // Check for unique violation
            if (error.code === '23505') {
                return NextResponse.json({ error: "Already favorite" }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('id');

    if (!activityId) {
        return NextResponse.json({ error: "Missing activity id" }, { status: 400 });
    }

    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('activity_id', activityId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
