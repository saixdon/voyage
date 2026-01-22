import React from 'react';
import { render, screen } from '@testing-library/react';
import TripCard from '@/components/dashboard/TripCard';

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({
        dateTime: (date: Date) => date.toLocaleDateString(),
    }),
}));

// Mock i18n/navigation
jest.mock('@/lib/i18n/navigation', () => ({
    Link: ({ children, href, className }: { children: React.ReactNode; href: string, className?: string }) => (
        <a href={href} className={className}>{children}</a>
    ),
}));

const mockTrip = {
    id: "trip-123",
    destination: "Paris",
    summary: "Romantic getaway",
    createdAt: new Date("2024-05-01"),
    items: [],
};

describe('TripCard', () => {
    it('renders trip details', () => {
        render(<TripCard trip={mockTrip} />);

        expect(screen.getByText("Paris")).toBeInTheDocument();
        expect(screen.getByText("Romantic getaway")).toBeInTheDocument();
        // Check for link to details
        expect(screen.getByRole('link', { name: /Paris/i })).toHaveAttribute('href', '/trips/trip-123');
    });
});
