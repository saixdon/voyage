import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | TripVega",
    description: "Privacy policy and information on how your personal data is handled at TripVega.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-gray-300 mb-6">
                        Last updated: January 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Controller</h2>
                        <p className="text-gray-300">
                            The controller responsible for data processing on this website is:<br />
                            TripVega<br />
                            [Your Address]<br />
                            E-Mail: contact@tripvega.com
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Collection and Processing of Personal Data</h2>
                        <p className="text-gray-300 mb-4">
                            We collect and process personal data only to the extent necessary to provide a functional website as well as our content and services.
                        </p>
                        <h3 className="text-xl font-medium text-white mb-2">2.1 When visiting our website</h3>
                        <p className="text-gray-300">
                            Each time our website is accessed, the following data is automatically collected:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 mt-2">
                            <li>IP address of the requesting computer</li>
                            <li>Date and time of access</li>
                            <li>Name and URL of the retrieved file</li>
                            <li>Website from which the access is made</li>
                            <li>Browser and operating system used</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Cookies</h2>
                        <p className="text-gray-300">
                            Our website uses cookies. Cookies are small text files that are stored on your device. They do not cause any harm and do not contain viruses. We use cookies to make our offer more user-friendly.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Services</h2>
                        <p className="text-gray-300 mb-4">
                            We use third-party services to display travel offers:
                        </p>
                        <h3 className="text-xl font-medium text-white mb-2">4.1 Viator (TripAdvisor)</h3>
                        <p className="text-gray-300">
                            We use the Viator API (a TripAdvisor group company) to display tours and activities to you. When you are redirected to Viator, their privacy policy applies.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
                        <p className="text-gray-300">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 mt-2">
                            <li>Access information about your data stored by us</li>
                            <li>Rectify incorrect data</li>
                            <li>Delete your data</li>
                            <li>Restrict data processing</li>
                            <li>Object to the processing</li>
                            <li>Data portability</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Contact</h2>
                        <p className="text-gray-300">
                            If you have any questions about the collection, processing, or use of your personal data, you can contact us at any time:
                        </p>
                        <p className="text-gray-300 mt-2">
                            E-Mail: privacy@tripvega.com
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                    <Link href="/" className="text-primary hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
