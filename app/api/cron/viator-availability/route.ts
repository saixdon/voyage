
import { NextRequest, NextResponse } from 'next/server';
import { ingestAvailability } from '@/lib/api/viator-ingestion';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const start = Date.now();
    const result = await ingestAvailability();
    const duration = Date.now() - start;

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
        processed: result.processed,
        duration_ms: duration,
        next_cursor: result.nextCursor
    });
}
