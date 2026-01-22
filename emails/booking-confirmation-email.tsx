import React from 'react';
import { Text, Button, Section, Heading, Row, Column } from '@react-email/components';
import { EmailLayout } from './components/Layout';

interface BookingConfirmationEmailProps {
    activityName?: string;
    date?: string;
    price?: string;
    bookingRef?: string;
    ticketUrl?: string;
}

export const BookingConfirmationEmail = ({
    activityName = 'Eiffel Tower Summit Access',
    date = 'October 15, 2026',
    price = '€45.00',
    bookingRef = 'TV-8829910',
    ticketUrl = 'http://localhost:3000/bookings',
}: BookingConfirmationEmailProps) => {
    return (
        <EmailLayout preview={`Booking Confirmed: ${activityName}`}>
            <Section>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4 text-2xl">
                        ✅
                    </div>
                    <Heading className="text-xl font-bold text-slate-900 m-0">
                        Booking Confirmed!
                    </Heading>
                    <Text className="text-slate-500 mt-2">
                        Your adventure is locked in. Here are the details.
                    </Text>
                </div>

                <Section className="bg-slate-50 rounded-lg border border-slate-200 p-6 mb-8">
                    <Row className="mb-4">
                        <Column>
                            <Text className="text-slate-500 text-xs uppercase tracking-wider font-semibold m-0">
                                Activity
                            </Text>
                            <Text className="text-slate-900 font-medium text-base m-0 mt-1">
                                {activityName}
                            </Text>
                        </Column>
                    </Row>
                    <Row className="mb-4">
                        <Column>
                            <Text className="text-slate-500 text-xs uppercase tracking-wider font-semibold m-0">
                                Date & Time
                            </Text>
                            <Text className="text-slate-900 font-medium text-base m-0 mt-1">
                                {date}
                            </Text>
                        </Column>
                        <Column>
                            <Text className="text-slate-500 text-xs uppercase tracking-wider font-semibold m-0">
                                Total Price
                            </Text>
                            <Text className="text-slate-900 font-medium text-base m-0 mt-1">
                                {price}
                            </Text>
                        </Column>
                    </Row>
                    <Row>
                        <Column>
                            <Text className="text-slate-500 text-xs uppercase tracking-wider font-semibold m-0">
                                Reference
                            </Text>
                            <Text className="text-slate-900 font-mono text-sm m-0 mt-1">
                                {bookingRef}
                            </Text>
                        </Column>
                    </Row>
                </Section>

                <Section className="text-center">
                    <Button
                        href={ticketUrl}
                        className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium text-sm w-full block text-center"
                    >
                        Manage Booking & View Tickets
                    </Button>
                    <Text className="text-slate-500 text-xs mt-4">
                        Need to make changes? You can modify your booking up to 24h before the start time.
                    </Text>
                </Section>
            </Section>
        </EmailLayout>
    );
};

export default BookingConfirmationEmail;
