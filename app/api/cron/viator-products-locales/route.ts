import { NextRequest, NextResponse } from 'next/server';
import { ingestProductsAllLocales, SUPPORTED_LOCALES } from '@/lib/api/viator-ingestion-v2';

/**
 * Cron Job: Ingest products for ALL supported locales
 * 
 * This should run AFTER the main English ingestion, 
 * e.g., every 6 hours instead of hourly (to reduce API calls)
 * 
 * Usage: GET /api/cron/viator-products-locales?locale=de (single)
 *    or: GET /api/cron/viator-products-locales (all locales)
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const singleLocale = searchParams.get('locale');

    const start = Date.now();

    try {
        if (singleLocale && SUPPORTED_LOCALES.includes(singleLocale)) {
            // Ingest single locale
            const { ingestProducts } = await import('@/lib/api/viator-ingestion-v2');
            const result = await ingestProducts(singleLocale);
            const duration = Date.now() - start;

            return NextResponse.json({
                locale: singleLocale,
                processed: result.processed,
                success: result.success,
                error: result.error,
                duration_ms: duration
            });
        } else {
            // Ingest all locales
            const { results } = await ingestProductsAllLocales();
            const duration = Date.now() - start;

            const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
            const failures = results.filter(r => !r.success);

            return NextResponse.json({
                locales: SUPPORTED_LOCALES,
                total_processed: totalProcessed,
                results: results.map(r => ({
                    locale: r.locale,
                    processed: r.processed,
                    success: r.success,
                    error: r.error
                })),
                failures_count: failures.length,
                duration_ms: duration
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
