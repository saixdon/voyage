import { checkAvailabilityAction } from '@/app/actions/viator';
import { getViatorAvailability, getViatorProductDetails } from '@/lib/api/viator-client';

// Mock the dependencies
jest.mock('@/lib/api/viator-client', () => ({
    getViatorAvailability: jest.fn(),
    getViatorProductDetails: jest.fn(),
}));

// Mock crypto since it's used in the action
jest.mock('crypto', () => ({
    randomUUID: () => 'test-uuid'
}));

// Mock authentication/session context if needed (not needed for this specific action based on code)

describe('checkAvailabilityAction', () => {
    const mockProductCode = '12345';
    const mockDate = '2026-05-20';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return available=true and price when API returns bookable items', async () => {
        (getViatorAvailability as jest.Mock).mockResolvedValue({
            bookableItems: [
                {
                    productOptionCode: 'DEFAULT',
                    totalPrice: {
                        price: { value: 50.00, currency: 'EUR' }
                    }
                }
            ],
            currency: 'EUR'
        });

        (getViatorProductDetails as jest.Mock).mockResolvedValue({
            productUrl: 'https://viator.com/test'
        });

        const result = await checkAvailabilityAction(mockProductCode, mockDate);

        expect(result.available).toBe(true);
        expect(result.price).toEqual({ amount: 50.00, currency: 'EUR' });
        // Expect generated link to contain our mock URL and UUID
        expect(result.affiliateUrl).toContain('https://viator.com/test');
        expect(getViatorAvailability).toHaveBeenCalledWith(mockProductCode, mockDate);
    });

    it('should return error if parameters are missing', async () => {
        const result = await checkAvailabilityAction('', '');
        expect(result.available).toBe(false);
        expect(result.error).toBe('Missing parameters');
    });

    it('should handle API 403 error nicely', async () => {
        (getViatorAvailability as jest.Mock).mockResolvedValue({
            error: '403 Forbidden'
        });

        const result = await checkAvailabilityAction(mockProductCode, mockDate);
        expect(result.available).toBe(false);
        expect(result.error).toContain('Access denied');
    });
});
