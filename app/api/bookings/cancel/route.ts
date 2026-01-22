
import { NextRequest, NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/api/viator-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingRef, reasonCode } = body;

        if (!bookingRef) {
            return NextResponse.json(
                { error: 'Missing required parameter: bookingRef' },
                { status: 400 }
            );
        }

        const result = await cancelBooking(bookingRef, reasonCode);

        if (result.error) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Cancellation Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
