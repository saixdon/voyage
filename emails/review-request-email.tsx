import React from 'react';
import { Text, Button, Section, Heading } from '@react-email/components';
import { EmailLayout } from './components/Layout';

interface ReviewRequestEmailProps {
    activityName?: string;
    reviewUrl?: string;
}

export const ReviewRequestEmail = ({
    activityName = 'Grand Canyon Helicopter Tour',
    reviewUrl = 'http://localhost:3000/reviews/new',
}: ReviewRequestEmailProps) => {
    return (
        <EmailLayout preview={`How was your experience at ${activityName}?`}>
            <Section className="text-center">
                <Heading className="text-xl font-bold text-slate-900 mb-4">
                    How was it? ⭐
                </Heading>
                <Text className="text-slate-600 mb-6">
                    We hope you had an amazing time at <strong>{activityName}</strong>.
                    Your feedback helps other travelers find the best experiences.
                </Text>

                <Section className="mb-8">
                    <Text className="text-slate-500 text-sm mb-4">Click to rate:</Text>
                    <div className="flex justify-center gap-2">
                        {/* This would ideally be a row of clickable stars or a single CTA */}
                        <Button href={reviewUrl} className="bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded shadow-sm hover:bg-slate-50 mr-2">⭐⭐⭐⭐⭐</Button>
                    </div>
                </Section>

                <Button
                    href={reviewUrl}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
                >
                    Write a Quick Review
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default ReviewRequestEmail;
