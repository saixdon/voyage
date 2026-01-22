import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardLayout from '@/app/[locale]/account/layout';

// Mock Sidebar component
jest.mock('@/components/dashboard/Sidebar', () => {
    return function MockSidebar() {
        return <div data-testid="sidebar">Sidebar Mock</div>;
    };
});

describe('DashboardLayout', () => {
    it('renders the sidebar', () => {
        render(
            <DashboardLayout>
                <div>Child Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('renders children content', () => {
        render(
            <DashboardLayout>
                <div data-testid="child-content">Child Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
});
