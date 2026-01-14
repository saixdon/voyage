import Link from "next/link";

export const metadata = {
    title: "Impressum | TripVega",
    description: "Impressum und rechtliche Informationen zu TripVega.",
};

export default function ImprintPage() {
    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Impressum</h1>

                <div className="prose prose-invert prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Angaben gemäß § 5 TMG</h2>
                        <p className="text-gray-300">
                            TripVega<br />
                            [Ihr vollständiger Name / Firmenname]<br />
                            [Straße und Hausnummer]<br />
                            [PLZ und Ort]<br />
                            Deutschland
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Kontakt</h2>
                        <p className="text-gray-300">
                            Telefon: [Ihre Telefonnummer]<br />
                            E-Mail: kontakt@tripvega.com
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Umsatzsteuer-ID</h2>
                        <p className="text-gray-300">
                            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                            [Ihre USt-IdNr., falls vorhanden]
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                        <p className="text-gray-300">
                            [Ihr Name]<br />
                            [Adresse]
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">EU-Streitschlichtung</h2>
                        <p className="text-gray-300">
                            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                            <a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                https://ec.europa.eu/consumers/odr/
                            </a>
                        </p>
                        <p className="text-gray-300 mt-2">
                            Unsere E-Mail-Adresse finden Sie oben im Impressum.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Verbraucherstreitbeilegung</h2>
                        <p className="text-gray-300">
                            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Haftung für Inhalte</h2>
                        <p className="text-gray-300">
                            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Haftung für Links</h2>
                        <p className="text-gray-300">
                            Unser Angebot enthält Links zu externen Websites Dritter (z.B. Viator/TripAdvisor), auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                    <Link href="/" className="text-primary hover:underline">
                        ← Zurück zur Startseite
                    </Link>
                </div>
            </div>
        </div>
    );
}
