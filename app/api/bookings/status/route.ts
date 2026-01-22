
import { NextRequest, NextResponse } from 'next/server';
import { getBookingStatus } from '@/lib/api/viator-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Typically takes a filter object

        const result = await getBookingStatus(body);

        if (result.error) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Booking Status Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
