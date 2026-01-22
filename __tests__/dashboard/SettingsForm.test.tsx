import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsForm from '@/components/dashboard/SettingsForm';

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// Mock server action
const mockUpdateProfile = jest.fn();

describe('SettingsForm', () => {
    it('renders profile inputs', () => {
        render(<SettingsForm user={{ name: "John", email: "john@example.com" }} updateAction={mockUpdateProfile} />);

        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
        expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
        // Email should be read-only usually or handled specifically
        expect(screen.getByLabelText("email")).toHaveAttribute("readonly");
    });

    it('submits updated name', async () => {
        render(<SettingsForm user={{ name: "John", email: "john@example.com" }} updateAction={mockUpdateProfile} />);

        const nameInput = screen.getByLabelText("name");
        fireEvent.change(nameInput, { target: { value: "Johnny" } });

        const saveButton = screen.getByRole("button", { name: "save" });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalledWith(expect.anything());
        });
    });
});
