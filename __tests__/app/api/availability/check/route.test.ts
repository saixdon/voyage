
import { POST } from '@/app/api/availability/check/route';
import { getViatorAvailability } from '@/lib/api/viator-client';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/viator-client');

describe('POST /api/availability/check', () => {
    it('should call getViatorAvailability with correct parameters', async () => {
        const body = {
            productCode: 'TEST_123',
            travelDate: '2026-10-10',
            paxMix: [{ ageBand: 'ADULT', numberOfTravelers: 2 }]
        };

        const request = new NextRequest('http://localhost/api/availability/check', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        (getViatorAvailability as jest.Mock).mockResolvedValue({ success: true });

        const response = await POST(request);

        expect(getViatorAvailability).toHaveBeenCalledWith(
            'TEST_123',
            '2026-10-10',
            [{ ageBand: 'ADULT', numberOfTravelers: 2 }]
        );
        expect(response.status).toBe(200);
    });

    it('should return 400 if productCode is missing', async () => {
        const request = new NextRequest('http://localhost/api/availability/check', {
            method: 'POST',
            body: JSON.stringify({ travelDate: '2026-10-10' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });
});
