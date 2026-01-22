
import { getViatorCancellationReasons } from '@/lib/api/viator-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('getViatorCancellationReasons', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        process.env.VIATOR_API_KEY = 'TEST_KEY';
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ reasons: [] }),
        });
    });

    it('should call the cancellation reasons endpoint', async () => {
        // @ts-ignore
        await getViatorCancellationReasons();

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings/cancel-reasons'),
            expect.objectContaining({
                method: 'GET',
            })
        );
    });
});
