
import { NextRequest, NextResponse } from 'next/server';
import { createViatorCartHold } from '@/lib/api/viator-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, currency } = body;
        console.log("Cart Hold Request:", JSON.stringify(body, null, 2));

        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error("Cart Hold Error: Missing items");
            return NextResponse.json(
                { error: 'Missing required parameters: items array' },
                { status: 400 }
            );
        }

        const result = await createViatorCartHold({ items, currency });
        console.log("Cart Hold Response from Viator:", JSON.stringify(result, null, 2));

        // Write to log file for agent debugging
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'debug_viator_hold.log');
            const logEntry = `
Timestamp: ${new Date().toISOString()}
Request: ${JSON.stringify(body, null, 2)}
Response: ${JSON.stringify(result, null, 2)}
----------------------------------------
`;
            fs.appendFileSync(logPath, logEntry);
        } catch (filesysError) {
            console.error("Failed to write log file", filesysError);
        }

        if (result.error) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Cart Hold Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
