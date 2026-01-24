/**
 * Viator Data Ingestion API Route
 * 
 * This endpoint triggers the ingestion of Viator data.
 * It should be called by a cron job or manually by an admin.
 * 
 * Security: Protected by a secret token in the Authorization header
 * 
 * Usage:
 *   GET /api/viator/ingest - Runs hourly delta sync (products + availability)
 *   GET /api/viator/ingest?type=all - Runs full sync (all entities)
 *   GET /api/viator/ingest?type=destinations - Syncs destinations only
 *   GET /api/viator/ingest?type=tags - Syncs tags only
 *   GET /api/viator/ingest?type=products - Syncs products only
 *   GET /api/viator/ingest?type=availability - Syncs availability only
 *   GET /api/viator/ingest?fullSync=true - Forces full re-sync from scratch
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    runFullIngestion,
    ingestDestinations,
    ingestTags,
    ingestProducts,
    ingestAvailabilitySchedules
} from '@/lib/viator/ingestion-service';

// Secret for protecting the ingestion endpoint
const INGEST_SECRET = process.env.VIATOR_INGEST_SECRET || 'dev-secret-change-in-production';

export async function GET(request: NextRequest) {
    // Verify authorization
    const authHeader = request.headers.get('Authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    // Also check query param for cron jobs that can't set headers
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get('secret');

    if (providedSecret !== INGEST_SECRET && querySecret !== INGEST_SECRET) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const type = searchParams.get('type') || 'hourly';
    const fullSync = searchParams.get('fullSync') === 'true';

    try {
        let results: Record<string, any> = {};

        switch (type) {
            case 'destinations':
                results.destinations = await ingestDestinations();
                break;

            case 'tags':
                results.tags = await ingestTags();
                break;

            case 'products':
                results.products = await ingestProducts(fullSync);
                break;

            case 'availability':
                results.availability = await ingestAvailabilitySchedules(fullSync);
                break;

            case 'all':
                // Full sync of all entities
                results = await runFullIngestion({
                    products: true,
                    availability: true,
                    destinations: true,
                    tags: true,
                    fullSync
                });
                break;

            case 'hourly':
            default:
                // Hourly sync: products and availability only (delta)
                results = await runFullIngestion({
                    products: true,
                    availability: true,
                    destinations: false,
                    tags: false,
                    fullSync: false
                });
                break;
        }

        return NextResponse.json({
            success: true,
            type,
            fullSync,
            results,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Ingestion API error:', error);
        return NextResponse.json(
            {
                error: 'Ingestion failed',
                message: error.message
            },
            { status: 500 }
        );
    }
}
