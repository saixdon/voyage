
import { NextRequest, NextResponse } from 'next/server';
import { getProductReviews } from '@/lib/api/viator-client';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const productCode = searchParams.get('productCode');
        const count = parseInt(searchParams.get('count') || '5', 10);
        const locale = searchParams.get('locale') || 'en';

        if (!productCode) {
            return NextResponse.json(
                { error: 'Missing required parameter: productCode' },
                { status: 400 }
            );
        }

        const result = await getProductReviews(productCode, locale, count);

        // If there's an error from the Viator API (common in sandbox),
        // return empty reviews gracefully instead of an error status
        if (result.error) {
            console.log('Reviews not available:', result.error);
            return NextResponse.json({ reviews: [], message: 'Reviews not available' });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Reviews Fetch Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
