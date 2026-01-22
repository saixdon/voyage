import React from 'react';
import { Text, Button, Section, Heading } from '@react-email/components';
import { EmailLayout } from './components/Layout';

interface BookingFailedEmailProps {
    activityName?: string;
    supportUrl?: string;
}

export const BookingFailedEmail = ({
    activityName = 'Activity Booking',
    supportUrl = 'http://localhost:3000/contact',
}: BookingFailedEmailProps) => {
    return (
        <EmailLayout preview="Action Required: Booking Payment Failed">
            <Section className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 text-2xl">
                    ⚠️
                </div>
                <Heading className="text-xl font-bold text-slate-900 mb-2">
                    Payment Unsuccessful
                </Heading>
                <Text className="text-slate-600 mb-6">
                    We were unable to process your payment for <strong>{activityName}</strong>.
                    This could be due to an expired card or a temporary bank issue.
                </Text>

                <Section className="bg-orange-50 p-4 rounded-lg mb-8 text-left border border-orange-100">
                    <Text className="text-orange-900 text-sm font-medium m-0">
                        Don't worry, you haven't been charged.
                    </Text>
                </Section>

                <Button
                    href={supportUrl}
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors"
                >
                    Try Again / Contact Support
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default BookingFailedEmail;
