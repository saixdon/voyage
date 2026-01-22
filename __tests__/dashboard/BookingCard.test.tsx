import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingCard from '@/components/dashboard/BookingCard';

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
    useFormatter: () => ({
        dateTime: (date: Date) => date.toLocaleDateString(),
        number: (val: number) => val.toString(),
    }),
}));

const mockBooking = {
    id: "123",
    product: {
        title: "Eiffel Tower Tour",
        image: "/eiffel.jpg",
    },
    status: "CONFIRMED",
    travelDate: new Date("2024-06-01"),
    totalPrice: 150,
    currency: "EUR"
};

describe('BookingCard', () => {
    it('renders booking details', () => {
        render(<BookingCard booking={mockBooking} />);

        expect(screen.getByText("Eiffel Tower Tour")).toBeInTheDocument();
        expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
        expect(screen.getByText(/150/)).toBeInTheDocument();
    });
});
