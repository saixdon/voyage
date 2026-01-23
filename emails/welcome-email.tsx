import React from 'react';
import { Text, Button, Section, Heading } from '@react-email/components';
import { EmailLayout } from './components/Layout';

interface WelcomeEmailProps {
    name?: string;
}

export const WelcomeEmail = ({ name = 'Traveler' }: WelcomeEmailProps) => {
    return (
        <EmailLayout preview="Welcome to TripVega - Your journey starts here">
            <Section className="text-center">
                <Heading className="text-xl font-bold text-slate-900 mb-4">
                    Welcome to TripVega, {name}! 🌍
                </Heading>
                <Text className="text-slate-600 mb-6 leading-relaxed">
                    We're thrilled to have you on board. TripVega is your AI-powered companion
                    for discovering and booking the world's most amazing experiences.
                </Text>

                <Section className="bg-indigo-50 p-6 rounded-lg mb-8 text-left">
                    <Text className="text-indigo-900 font-medium mb-2">
                        🚀 <strong>Get started in 3 easy steps:</strong>
                    </Text>
                    <Text className="text-slate-700 my-1">
                        1. <strong>Create a Trip Board:</strong> Start planning your dream vacation.
                    </Text>
                    <Text className="text-slate-700 my-1">
                        2. <strong>Ask AI for Suggestions:</strong> Let our AI find hidden gems for you.
                    </Text>
                    <Text className="text-slate-700 my-1">
                        3. <strong>Book & Go:</strong> Secure your activities instantly.
                    </Text>
                </Section>

                <Button
                    href="http://localhost:3000"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium text-sm"
                >
                    Start Exploring Now
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default WelcomeEmail;
