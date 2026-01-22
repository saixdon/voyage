import React from 'react';
import { Text, Button, Section, Heading } from '@react-email/components';
import { EmailLayout } from './components/Layout';

interface TripReminderEmailProps {
    userName?: string;
    activityName?: string;
    timeUntil?: string; // e.g. "Tomorrow at 10:00 AM"
    manageUrl?: string;
}

export const TripReminderEmail = ({
    userName = 'Traveler',
    activityName = 'Louvre Museum Guided Tour',
    timeUntil = 'Tomorrow at 9:00 AM',
    manageUrl = 'http://localhost:3000/bookings',
}: TripReminderEmailProps) => {
    return (
        <EmailLayout preview={`Reminder: Your trip to ${activityName} is coming up!`}>
            <Section>
                <Heading className="text-xl font-bold text-slate-900 mb-4">
                    Ready for your adventure, {userName}? 🎒
                </Heading>
                <Text className="text-slate-600 mb-6">
                    This is a friendly reminder that your experience <strong>{activityName}</strong> is scheduled for:
                </Text>

                <Section className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg mb-8 text-center">
                    <Text className="text-indigo-900 font-bold text-lg m-0">
                        {timeUntil}
                    </Text>
                </Section>

                <Text className="text-slate-600 mb-6 font-medium">
                    Quick Tips:
                </Text>
                <ul className="text-slate-600 mb-8 pl-5">
                    <li className="mb-2">Arrive 15 minutes early</li>
                    <li className="mb-2">Have your digital ticket ready</li>
                    <li className="mb-2">Check the weather forecast</li>
                </ul>

                <div className="text-center">
                    <Button
                        href={manageUrl}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
                    >
                        View Ticket & Details
                    </Button>
                </div>
            </Section>
        </EmailLayout>
    );
};

export default TripReminderEmail;
