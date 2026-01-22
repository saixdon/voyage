import React from 'react';
import { render, screen } from '@testing-library/react';
import FavoriteCard from '@/components/dashboard/FavoriteCard';

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({
        number: (val: number) => val.toString(),
    }),
}));

// Mock i18n/navigation
jest.mock('@/lib/i18n/navigation', () => ({
    Link: ({ children, href, className }: { children: React.ReactNode; href: string, className?: string }) => (
        <a href={href} className={className}>{children}</a>
    ),
}));

const mockFavorite = {
    id: "fav-1",
    product: {
        productCode: "P123",
        title: "Louvre Museum",
        primaryImage: "/louvre.jpg",
        priceFrom: 17,
        currency: "EUR",
        rating: 4.8,
        reviewCount: 2000
    }
};

describe('FavoriteCard', () => {
    it('renders favorite product details', () => {
        render(<FavoriteCard favorite={mockFavorite} />);

        expect(screen.getByText("Louvre Museum")).toBeInTheDocument();
        expect(screen.getByText(/17/)).toBeInTheDocument();
        expect(screen.getByText(/4.8/)).toBeInTheDocument();
        expect(screen.getByText(/2000/)).toBeInTheDocument();
    });
});
