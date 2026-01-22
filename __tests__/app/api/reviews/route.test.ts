
import { GET } from '@/app/api/reviews/route';
import { getProductReviews } from '@/lib/api/viator-client';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/viator-client');

describe('GET /api/reviews', () => {
    it('should call getProductReviews with correct parameters', async () => {
        const request = new NextRequest('http://localhost/api/reviews?productCode=P123&count=10', {
            method: 'GET',
        });

        (getProductReviews as jest.Mock).mockResolvedValue({ reviews: [] });

        const response = await GET(request);

        expect(getProductReviews).toHaveBeenCalledWith('P123', 'en', 10);
        expect(response.status).toBe(200);
    });

    it('should return 400 quite productCode is missing', async () => {
        const request = new NextRequest('http://localhost/api/reviews', {
            method: 'GET',
        });

        const response = await GET(request);
        expect(response.status).toBe(400);
    });
});
