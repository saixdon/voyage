import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // TODO: Implement GetYourGuide API Proxy with caching
    return NextResponse.json({
        message: "Get activity detail endpoint",
        id,
        data: null,
    });
}
