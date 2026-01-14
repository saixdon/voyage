import { NextRequest, NextResponse } from "next/server";

/**
 * Validates HTTP Basic Auth credentials for GetYourGuide API endpoints.
 * Returns null if valid, or a 401 Response if invalid.
 */
export function validateGygAuth(request: NextRequest): NextResponse | null {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        return NextResponse.json(
            { error: "Unauthorized", message: "Missing or invalid Authorization header" },
            { status: 401, headers: { "WWW-Authenticate": 'Basic realm="GYG API"' } }
        );
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [username, password] = credentials.split(":");

    const expectedUsername = process.env.GYG_INTEGRATOR_USERNAME;
    const expectedPassword = process.env.GYG_INTEGRATOR_PASSWORD;

    if (username !== expectedUsername || password !== expectedPassword) {
        return NextResponse.json(
            { error: "Unauthorized", message: "Invalid credentials" },
            { status: 401, headers: { "WWW-Authenticate": 'Basic realm="GYG API"' } }
        );
    }

    return null; // Auth successful
}
