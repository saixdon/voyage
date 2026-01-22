
import { NextRequest, NextResponse } from 'next/server';
import { getViatorAvailability } from '@/lib/api/viator-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productCode, travelDate, paxMix } = body;

        if (!productCode || !travelDate) {
            return NextResponse.json(
                { error: 'Missing required parameters: productCode, travelDate' },
                { status: 400 }
            );
        }

        const result = await getViatorAvailability(productCode, travelDate, paxMix);

        if (result.error) {
            // Determine status code based on error message or return 400/500
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Availability Check Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
