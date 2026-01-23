import React from 'react';
import { Text, Section, Heading } from '@react-email/components';
import { EmailLayout } from './components/Layout';

interface VerificationEmailProps {
    code?: string;
    name?: string;
}

export const VerificationEmail = ({
    code = '123456',
    name = 'Reisender'
}: VerificationEmailProps) => {
    return (
        <EmailLayout preview={`Dein Bestätigungscode: ${code}`}>
            <Section className="text-center">
                <Heading className="text-xl font-bold text-slate-900 mb-4">
                    Willkommen bei TripVega, {name}! 🌍
                </Heading>
                <Text className="text-slate-600 mb-6">
                    Bitte bestätige deine E-Mail-Adresse mit folgendem Code:
                </Text>

                <Section className="bg-slate-100 border-2 border-slate-200 rounded-xl py-6 px-8 mb-8">
                    <Text className="text-4xl font-mono font-bold text-slate-900 tracking-[0.3em] m-0">
                        {code}
                    </Text>
                </Section>

                <Text className="text-slate-500 text-sm mb-4">
                    Der Code ist <strong>10 Minuten</strong> gültig.
                </Text>

                <Text className="text-slate-400 text-xs">
                    Falls du dich nicht bei TripVega registriert hast, ignoriere diese E-Mail.
                </Text>
            </Section>
        </EmailLayout>
    );
};

export default VerificationEmail;
