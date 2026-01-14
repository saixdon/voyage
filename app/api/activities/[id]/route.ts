import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    // TODO: Implement GetYourGuide API Proxy with caching
    return NextResponse.json({
        message: "Get activity detail endpoint",
        id,
        data: null,
    });
}
