import React from 'react';
import { render, screen } from '@testing-library/react';
import TripList from '@/components/dashboard/TripList';

// Mock TripCard
jest.mock('@/components/dashboard/TripCard', () => {
    return function MockTripCard({ trip }: { trip: any }) {
        return <div data-testid="trip-card">{trip.destination}</div>;
    };
});

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// Mock i18n/navigation
jest.mock('@/lib/i18n/navigation', () => ({
    Link: ({ children, href, className }: { children: React.ReactNode; href: string, className?: string }) => (
        <a href={href} className={className}>{children}</a>
    ),
}));

const mockTrips = [
    {
        id: "1",
        destination: "Tokyo",
        summary: "Japan Trip",
        createdAt: new Date(),
        items: []
    },
    {
        id: "2",
        destination: "New York",
        summary: "USA Trip",
        createdAt: new Date(),
        items: []
    }
];

describe('TripList', () => {
    it('renders a list of trip cards', () => {
        render(<TripList trips={mockTrips} />);

        const cards = screen.getAllByTestId('trip-card');
        expect(cards).toHaveLength(2);
        expect(screen.getByText('Tokyo')).toBeInTheDocument();
        expect(screen.getByText('New York')).toBeInTheDocument();
    });

    it('renders empty state when no trips', () => {
        render(<TripList trips={[]} />);

        expect(screen.getByText('empty.title')).toBeInTheDocument();
        expect(screen.getByText('empty.action')).toBeInTheDocument();
    });
});
