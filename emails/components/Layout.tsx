import React from 'react';
import {
    Html,
    Body,
    Head,
    Heading,
    Container,
    Preview,
    Section,
    Text,
    Link,
    Tailwind,
    Img,
} from '@react-email/components';

interface LayoutProps {
    preview?: string;
    loading?: boolean;
    children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: LayoutProps) => {
    return (
        <Html>
            <Head />
            <Preview>{preview || " "}</Preview>
            <Tailwind>
                <Body className="bg-slate-50 relative font-sans">
                    <Container className="bg-white my-10 mx-auto p-8 rounded-xl border border-slate-200 shadow-sm max-w-[600px]">
                        <Section className="mb-8 border-b border-slate-100 pb-6 text-center">
                            <Heading className="text-2xl font-bold text-slate-900 m-0">
                                TripVega
                            </Heading>
                            <Text className="text-slate-500 text-sm mt-1">Discover the World</Text>
                        </Section>

                        <Section className="min-h-[300px]">
                            {children}
                        </Section>

                        <Section className="mt-8 border-t border-slate-100 pt-6">
                            <Text className="text-xs text-slate-400 text-center mb-2">
                                © {new Date().getFullYear()} TripVega. All rights reserved.
                            </Text>
                            <Text className="text-xs text-slate-400 text-center">
                                <Link
                                    href="http://localhost:3000"
                                    className="text-slate-500 underline"
                                >
                                    Visit Website
                                </Link>
                                {' • '}
                                <Link
                                    href="#"
                                    className="text-slate-500 underline"
                                >
                                    Unsubscribe
                                </Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
