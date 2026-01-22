
import { createViatorCartHold } from '@/lib/api/viator-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('createViatorCartHold', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        process.env.VIATOR_API_KEY = 'TEST_KEY';
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ cartRef: 'CART-123' }),
        });
    });

    it('should call the cart hold endpoint with correct payload', async () => {
        const payload = {
            items: [
                {
                    productCode: 'P1',
                    travelDate: '2026-10-10',
                    paxMix: [{ ageBand: 'ADULT', numberOfTravelers: 2 }]
                }
            ],
            currency: 'EUR'
        };

        // @ts-ignore
        await createViatorCartHold(payload);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings/cart/hold'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(payload),
            })
        );
    });
});
