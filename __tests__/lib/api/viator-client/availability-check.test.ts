
import { getViatorAvailability } from '@/lib/api/viator-client';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('getViatorAvailability', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        process.env.VIATOR_API_KEY = 'TEST_KEY';

        // Default success response
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ bookableItems: [] }),
        });
    });

    it('should include paxMix in the request body when provided', async () => {
        const productCode = 'TEST_PRODUCT';
        const travelDate = '2026-05-20';
        const paxMix = [{ ageBand: 'ADULT', numberOfTravelers: 2 }];

        // @ts-ignore - Argument of type '...' is not assignable to parameter of type '...'.
        // We expect this to fail compilation in TypeScript if we rely on static checking, 
        // but for TDD runtime test, we are invoking it with new args.
        await getViatorAvailability(productCode, travelDate, paxMix);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/availability/check'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"paxMix":[{"ageBand":"ADULT","numberOfTravelers":2}]'),
            })
        );
    });
});
