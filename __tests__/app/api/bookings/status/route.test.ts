
import { POST } from '@/app/api/bookings/status/route';
import { getBookingStatus } from '@/lib/api/viator-client';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/viator-client');

describe('POST /api/bookings/status', () => {
    it('should call getBookingStatus with correct parameters', async () => {
        const body = {
            bookingRef: 'BR-123'
        };

        const request = new NextRequest('http://localhost/api/bookings/status', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        (getBookingStatus as jest.Mock).mockResolvedValue({ status: 'CONFIRMED' });

        const response = await POST(request);

        expect(getBookingStatus).toHaveBeenCalledWith(body);
        expect(response.status).toBe(200);
    });
});
