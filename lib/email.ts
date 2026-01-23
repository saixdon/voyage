import { Resend } from 'resend';

// Initialize Resend only if API key is present, otherwise handle gracefully
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

interface SendEmailProps {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailProps) {
    // Development mode interception
    if (process.env.NODE_ENV !== 'production' && !process.env.RESEND_API_KEY) {
        console.log('----------------------------------------');
        console.log(`[DEV MODE] Sending email to: ${to}`);
        console.log(`[DEV MODE] Subject: ${subject}`);
        console.log('----------------------------------------');
        return { success: true, id: 'dev-mode' };
    }

    try {
        if (!resend) {
            console.warn('Resend API key not found. Email not sent.');
            return { success: false, error: 'Resend API key missing' };
        }

        const data = await resend.emails.send({
            from: 'TripVega <support@tripvega.com>', // Verified domain
            to,
            subject,
            react,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}
