import Link from "next/link";

export const metadata = {
    title: "Imprint | TripVega",
    description: "Imprint and legal information about TripVega.",
};

export default function ImprintPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-foreground mb-8">Imprint</h1>

                <div className="prose dark:prose-invert prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Information according to § 5 TMG</h2>
                        <p className="text-muted-foreground">
                            TripVega<br />
                            [Your Full Name / Company Name]<br />
                            [Street and House Number]<br />
                            [ZIP and City]<br />
                            Germany
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
                        <p className="text-muted-foreground">
                            Phone: [Your Phone Number]<br />
                            E-Mail: contact@tripvega.com
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">VAT ID</h2>
                        <p className="text-muted-foreground">
                            VAT Identification Number according to § 27 a VAT Act:<br />
                            [Your VAT ID, if available]
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Responsible for Content according to § 55 Para. 2 RStV</h2>
                        <p className="text-muted-foreground">
                            [Your Name]<br />
                            [Address]
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">EU Dispute Resolution</h2>
                        <p className="text-muted-foreground">
                            The European Commission provides a platform for online dispute resolution (ODR):{" "}
                            <a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                https://ec.europa.eu/consumers/odr/
                            </a>
                        </p>
                        <p className="text-muted-foreground mt-2">
                            Our email address can be found above in the imprint.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Consumer Dispute Resolution</h2>
                        <p className="text-muted-foreground">
                            We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Liability for Content</h2>
                        <p className="text-muted-foreground">
                            As a service provider, we are responsible for our own content on these pages according to the general laws pursuant to § 7 Para. 1 TMG. According to §§ 8 to 10 TMG, however, we as a service provider are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Liability for Links</h2>
                        <p className="text-muted-foreground">
                            Our offer contains links to external websites of third parties (e.g., Viator/TripAdvisor), over whose content we have no influence. Therefore, we cannot assume any liability for this external content. The respective provider or operator of the pages is always responsible for the content of the linked pages.
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
