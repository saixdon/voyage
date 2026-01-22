
import { POST } from '@/app/api/bookings/book/route';
import { createViatorBooking } from '@/lib/api/viator-client';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/viator-client');

describe('POST /api/bookings/book', () => {
    it('should call createViatorBooking with correct parameters', async () => {
        const body = {
            cartRef: 'CART-123',
            booker: {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe'
            },
            paymentToken: 'TOK-123',
            currency: 'EUR'
        };

        const request = new NextRequest('http://localhost/api/bookings/book', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        (createViatorBooking as jest.Mock).mockResolvedValue({ bookingRef: 'BR-123', status: 'CONFIRMED' });

        const response = await POST(request);

        expect(createViatorBooking).toHaveBeenCalledWith(body);
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json).toEqual({ bookingRef: 'BR-123', status: 'CONFIRMED' });
    });

    it('should return 400 if cartRef or booker is missing', async () => {
        const request = new NextRequest('http://localhost/api/bookings/book', {
            method: 'POST',
            body: JSON.stringify({ currency: 'EUR' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });
});
