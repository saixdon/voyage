import Link from "next/link";

export const metadata = {
    title: "AGB | TripVega",
    description: "Allgemeine Geschäftsbedingungen von TripVega.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Allgemeine Geschäftsbedingungen</h1>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-gray-300 mb-6">
                        Zuletzt aktualisiert: Januar 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Geltungsbereich</h2>
                        <p className="text-gray-300">
                            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Website TripVega (nachfolgend "Plattform" genannt) und die darüber angebotenen Dienste.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Leistungsbeschreibung</h2>
                        <p className="text-gray-300 mb-4">
                            TripVega ist eine Vermittlungsplattform für Touren, Aktivitäten und Erlebnisse. Wir vermitteln Angebote von Drittanbietern, insbesondere von Viator (TripAdvisor).
                        </p>
                        <p className="text-gray-300">
                            <strong className="text-white">Wichtiger Hinweis:</strong> TripVega ist nicht selbst Veranstalter oder Anbieter der dargestellten Touren und Aktivitäten. Der Vertrag über die gebuchte Leistung kommt direkt zwischen Ihnen und dem jeweiligen Anbieter (z.B. Viator) zustande.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Buchungsprozess</h2>
                        <p className="text-gray-300">
                            Wenn Sie auf unserer Plattform ein Angebot auswählen und auf "Buchen" klicken, werden Sie auf die Website des jeweiligen Anbieters (z.B. viator.com) weitergeleitet. Die Buchung und Zahlungsabwicklung erfolgt dort direkt. Es gelten die AGB des jeweiligen Anbieters.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Preise</h2>
                        <p className="text-gray-300">
                            Die auf unserer Plattform angezeigten Preise sind Richtwerte und können sich ändern. Der verbindliche Preis wird Ihnen beim Buchungsvorgang auf der Website des Anbieters angezeigt.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Stornierung und Erstattung</h2>
                        <p className="text-gray-300">
                            Für Stornierungen und Erstattungen gelten die Bedingungen des jeweiligen Anbieters. Bitte wenden Sie sich bei Fragen direkt an den Anbieter der gebuchten Leistung.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Haftungsausschluss</h2>
                        <p className="text-gray-300">
                            TripVega übernimmt keine Haftung für:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 mt-2">
                            <li>Die Durchführung, Qualität oder Sicherheit der vermittelten Leistungen</li>
                            <li>Die Richtigkeit der von Drittanbietern bereitgestellten Informationen</li>
                            <li>Schäden, die aus der Nutzung der Drittanbieter-Websites entstehen</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Urheberrecht</h2>
                        <p className="text-gray-300">
                            Die auf unserer Plattform veröffentlichten Inhalte unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung bedürfen der schriftlichen Zustimmung.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Schlussbestimmungen</h2>
                        <p className="text-gray-300">
                            Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht.
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
