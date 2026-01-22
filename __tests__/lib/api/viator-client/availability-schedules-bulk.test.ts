
import { getViatorAvailabilitySchedulesBulk } from '@/lib/api/viator-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('getViatorAvailabilitySchedulesBulk', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        process.env.VIATOR_API_KEY = 'TEST_KEY';
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ availabilitySchedules: [] }),
        });
    });

    it('should call the bulk endpoint with product codes', async () => {
        const productCodes = ['P1', 'P2'];
        // @ts-ignore
        await getViatorAvailabilitySchedulesBulk(productCodes);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/availability/schedules/bulk'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ productCodes: ['P1', 'P2'] }),
            })
        );
    });
});
