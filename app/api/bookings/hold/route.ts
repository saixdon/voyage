
import { NextRequest, NextResponse } from 'next/server';
import { createViatorCartHold } from '@/lib/api/viator-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, currency } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required parameters: items array' },
                { status: 400 }
            );
        }

        const result = await createViatorCartHold({ items, currency });

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
