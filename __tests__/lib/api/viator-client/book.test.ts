
import { createViatorBooking } from '@/lib/api/viator-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('createViatorBooking', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        process.env.VIATOR_API_KEY = 'TEST_KEY';
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ bookingRef: 'BR-123' }),
        });
    });

    it('should call the booking endpoint with correct payload', async () => {
        const payload = {
            cartRef: 'CART-123',
            booker: {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+1234567890'
            },
            paymentToken: 'TOK-123',
            currency: 'EUR'
        };

        // @ts-ignore
        await createViatorBooking(payload);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings/cart/book'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(payload),
            })
        );
    });
});
