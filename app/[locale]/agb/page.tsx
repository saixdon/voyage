import Link from "next/link";

export const metadata = {
    title: "Terms & Conditions | TripVega",
    description: "General Terms and Conditions of TripVega.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>

                <div className="prose dark:prose-invert prose-lg max-w-none">
                    <p className="text-muted-foreground mb-6">
                        Last updated: January 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Scope</h2>
                        <p className="text-muted-foreground">
                            These General Terms and Conditions (GTC) apply to the use of the TripVega website (hereinafter referred to as the "Platform") and the services offered thereon.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Services</h2>
                        <p className="text-muted-foreground mb-4">
                            TripVega is an intermediary platform for tours, activities, and experiences. We arrange offers from third-party providers, in particular from Viator (TripAdvisor).
                        </p>
                        <p className="text-muted-foreground">
                            <strong className="text-foreground">Important Notice:</strong> TripVega is not the organizer or provider of the displayed tours and activities. The contract for the booked service is concluded directly between you and the respective provider (e.g., Viator).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. Booking Process</h2>
                        <p className="text-muted-foreground">
                            When you select an offer on our platform and click "Book," you will be redirected to the respective provider's website (e.g., viator.com). The booking and payment processing take place directly there. The GTC of the respective provider apply.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Prices</h2>
                        <p className="text-muted-foreground">
                            The prices displayed on our platform are indicative and may change. The binding price will be shown to you during the booking process on the provider's website.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cancellation and Refund</h2>
                        <p className="text-muted-foreground">
                            The conditions of the respective provider apply to cancellations and refunds. Please contact the provider of the booked service directly with any questions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">6. Disclaimer</h2>
                        <p className="text-muted-foreground">
                            TripVega assumes no liability for:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2">
                            <li>The performance, quality, or safety of the arranged services</li>
                            <li>The accuracy of the information provided by third-party providers</li>
                            <li>Damages resulting from the use of third-party provider websites</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">7. Copyright</h2>
                        <p className="text-muted-foreground">
                            The content published on our platform is subject to German copyright law. Duplication, processing, distribution, and any kind of exploitation require written consent.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">8. Final Provisions</h2>
                        <p className="text-muted-foreground">
                            The law of the Federal Republic of Germany applies. Should individual provisions of these GTC be invalid, this shall not affect the validity of the remaining provisions.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-theme">
                    <Link href="/" className="text-primary hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
