import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/dashboard/Sidebar';
import { usePathname } from '@/lib/i18n/navigation';

// Mock lib/i18n/navigation
jest.mock('@/lib/i18n/navigation', () => ({
    usePathname: jest.fn(),
    Link: ({ children, href, className }: { children: React.ReactNode; href: string, className?: string }) => (
        <a href={href} className={className}>{children}</a>
    ),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('Sidebar', () => {
    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/account');
    });

    it('renders all navigation links', () => {
        render(<Sidebar />);

        // Since icons might have the same text name as label keys, use getAllByText
        expect(screen.getAllByText('dashboard')[0]).toBeInTheDocument();
        expect(screen.getByText('bookings')).toBeInTheDocument();
        expect(screen.getByText('trips')).toBeInTheDocument();

        // favorites might be icon and text
        const favs = screen.getAllByText('favorites');
        expect(favs.length).toBeGreaterThan(0);

        // settings might be icon and text
        const settings = screen.getAllByText('settings');
        expect(settings.length).toBeGreaterThan(0);
    });

    it('marks the current link as active', () => {
        (usePathname as jest.Mock).mockReturnValue('/account/bookings');
        render(<Sidebar />);

        // Since bookings has a unique text, it should be fine. 
        // If not, we rely on the implementation that "bookings" label is unique enough or the icon doesn't match
        const bookingLink = screen.getByText('bookings').closest('a');
        expect(bookingLink).toHaveClass('bg-primary/10');
        expect(bookingLink).toHaveClass('text-primary');
    });

    it('shows user profile summary', () => {
        render(<Sidebar />);
        expect(screen.getByText('myAccount')).toBeInTheDocument();
    });
});
