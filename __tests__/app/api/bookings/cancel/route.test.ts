
import { POST } from '@/app/api/bookings/cancel/route';
import { cancelBooking } from '@/lib/api/viator-client';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/viator-client');

describe('POST /api/bookings/cancel', () => {
    it('should call cancelBooking with correct parameters', async () => {
        const body = {
            bookingRef: 'BR-123',
            reasonCode: 'CustomerRequest'
        };

        const request = new NextRequest('http://localhost/api/bookings/cancel', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        (cancelBooking as jest.Mock).mockResolvedValue({ status: 'CANCELLED' });

        const response = await POST(request);

        expect(cancelBooking).toHaveBeenCalledWith('BR-123', 'CustomerRequest');
        expect(response.status).toBe(200);
    });

    it('should return 400 if bookingRef is missing', async () => {
        const request = new NextRequest('http://localhost/api/bookings/cancel', {
            method: 'POST',
            body: JSON.stringify({ reasonCode: 'ABC' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });
});
