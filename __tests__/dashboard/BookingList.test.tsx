import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingList from '@/components/dashboard/BookingList';

// Mock BookingCard to avoid testing it again and simplify
jest.mock('@/components/dashboard/BookingCard', () => {
    return function MockBookingCard({ booking }: { booking: any }) {
        return <div data-testid="booking-card">{booking.product.title}</div>;
    };
});

// Mock lib/i18n/navigation
jest.mock('@/lib/i18n/navigation', () => ({
    Link: ({ children, href, className }: { children: React.ReactNode; href: string, className?: string }) => (
        <a href={href} className={className}>{children}</a>
    ),
    usePathname: jest.fn(),
    useRouter: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

const mockBookings = [
    {
        id: "1",
        product: { title: "Tour 1", image: "/img1.jpg" },
        status: "CONFIRMED",
        travelDate: new Date("2024-06-01"),
        totalPrice: 100,
        currency: "EUR"
    },
    {
        id: "2",
        product: { title: "Tour 2", image: "/img2.jpg" },
        status: "PENDING",
        travelDate: new Date("2024-07-01"),
        totalPrice: 200,
        currency: "USD"
    }
];

describe('BookingList', () => {
    it('renders a list of booking cards', () => {
        render(<BookingList bookings={mockBookings} />);

        const cards = screen.getAllByTestId('booking-card');
        expect(cards).toHaveLength(2);
        expect(screen.getByText('Tour 1')).toBeInTheDocument();
        expect(screen.getByText('Tour 2')).toBeInTheDocument();
    });

    it('renders empty state when no bookings', () => {
        render(<BookingList bookings={[]} />);

        expect(screen.getByText('empty.title')).toBeInTheDocument();
        expect(screen.getByText('empty.description')).toBeInTheDocument();
    });
});
