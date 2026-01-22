
import { POST } from '@/app/api/bookings/hold/route';
import { createViatorCartHold } from '@/lib/api/viator-client';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/viator-client');

describe('POST /api/bookings/hold', () => {
    it('should call createViatorCartHold with correct parameters', async () => {
        const body = {
            items: [
                {
                    productCode: 'P1',
                    travelDate: '2026-10-10',
                    paxMix: [{ ageBand: 'ADULT', numberOfTravelers: 2 }]
                }
            ],
            currency: 'EUR'
        };

        const request = new NextRequest('http://localhost/api/bookings/hold', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        (createViatorCartHold as jest.Mock).mockResolvedValue({ cartRef: 'CART-123' });

        const response = await POST(request);

        expect(createViatorCartHold).toHaveBeenCalledWith(body);
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json).toEqual({ cartRef: 'CART-123' });
    });

    it('should return 400 if items are missing', async () => {
        const request = new NextRequest('http://localhost/api/bookings/hold', {
            method: 'POST',
            body: JSON.stringify({ currency: 'EUR' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });
});
