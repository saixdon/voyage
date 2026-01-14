import { NextRequest, NextResponse } from "next/server";
import { validateGygAuth } from "@/lib/auth/gyg-auth";

export async function GET(request: NextRequest) {
    const authError = validateGygAuth(request);
    if (authError) return authError;

    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0",
    });
}
