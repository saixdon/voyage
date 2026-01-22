
import { NextRequest, NextResponse } from 'next/server';
import { getProductReviews } from '@/lib/api/viator-client';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const productCode = searchParams.get('productCode');
        const count = parseInt(searchParams.get('count') || '5', 10);
        // We could also get locale from header or param, defaulting to en
        const locale = 'en'; // Simplify for now

        if (!productCode) {
            return NextResponse.json(
                { error: 'Missing required parameter: productCode' },
                { status: 400 }
            );
        }

        const result = await getProductReviews(productCode, locale, count);

        if (result.error) {
            return NextResponse.json(result, { status: 400 });
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
