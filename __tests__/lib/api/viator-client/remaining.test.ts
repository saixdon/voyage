
import {
    getBookingsModifiedSince,
    getBookingStatus,
    cancelBookingQuote,
    cancelBooking,
    getProductReviews
} from '@/lib/api/viator-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Viator Client Remaining Endpoints', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        process.env.VIATOR_API_KEY = 'TEST_KEY';
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
    });

    it('getBookingsModifiedSince', async () => {
        // @ts-ignore
        await getBookingsModifiedSince('2026-01-01T00:00:00Z');
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings/modified-since?modified-since=2026-01-01T00:00:00Z'),
            expect.objectContaining({ method: 'GET' })
        );
    });

    it('getBookingStatus', async () => {
        // @ts-ignore
        await getBookingStatus();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings/status'),
            expect.objectContaining({ method: 'POST' }) // Status is usually POST with filter or GET? 
            // Docs say: POST /bookings/status with body
        );
    });

    it('cancelBookingQuote', async () => {
        // @ts-ignore
        await cancelBookingQuote('BR-123');
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings/BR-123/cancel-quote'),
            expect.objectContaining({ method: 'GET' })
        );
    });

    it('cancelBooking', async () => {
        // @ts-ignore
        await cancelBooking('BR-123', 'Customer Request');
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings/BR-123/cancel'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('Customer Request')
            })
        );
    });

    it('getProductReviews', async () => {
        // @ts-ignore
        await getProductReviews('P123');
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/reviews/product?productCode=P123'),
            expect.objectContaining({ method: 'GET' })
        );
    });
});
