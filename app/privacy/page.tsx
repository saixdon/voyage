import Link from "next/link";

export const metadata = {
    title: "Datenschutzerklärung | TripVega",
    description: "Datenschutzerklärung und Informationen zum Umgang mit Ihren personenbezogenen Daten bei TripVega.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Datenschutzerklärung</h1>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-gray-300 mb-6">
                        Zuletzt aktualisiert: Januar 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Verantwortlicher</h2>
                        <p className="text-gray-300">
                            Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
                            TripVega<br />
                            [Ihre Adresse]<br />
                            E-Mail: kontakt@tripvega.com
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
                        <p className="text-gray-300 mb-4">
                            Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.
                        </p>
                        <h3 className="text-xl font-medium text-white mb-2">2.1 Beim Besuch unserer Website</h3>
                        <p className="text-gray-300">
                            Bei jedem Zugriff auf unsere Website werden automatisch folgende Daten erhoben:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 mt-2">
                            <li>IP-Adresse des anfragenden Rechners</li>
                            <li>Datum und Uhrzeit des Zugriffs</li>
                            <li>Name und URL der abgerufenen Datei</li>
                            <li>Website, von der aus der Zugriff erfolgt</li>
                            <li>Verwendeter Browser und Betriebssystem</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Cookies</h2>
                        <p className="text-gray-300">
                            Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Sie richten keinen Schaden an und enthalten keine Viren. Wir verwenden Cookies, um unser Angebot nutzerfreundlicher zu gestalten.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Drittanbieter-Dienste</h2>
                        <p className="text-gray-300 mb-4">
                            Wir nutzen Dienste von Drittanbietern zur Anzeige von Reiseangeboten:
                        </p>
                        <h3 className="text-xl font-medium text-white mb-2">4.1 Viator (TripAdvisor)</h3>
                        <p className="text-gray-300">
                            Wir nutzen die API von Viator (ein Unternehmen der TripAdvisor-Gruppe), um Ihnen Touren und Aktivitäten anzuzeigen. Bei der Weiterleitung zu Viator gelten deren Datenschutzbestimmungen.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Ihre Rechte</h2>
                        <p className="text-gray-300">
                            Sie haben das Recht auf:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 mt-2">
                            <li>Auskunft über Ihre bei uns gespeicherten Daten</li>
                            <li>Berichtigung unrichtiger Daten</li>
                            <li>Löschung Ihrer Daten</li>
                            <li>Einschränkung der Datenverarbeitung</li>
                            <li>Widerspruch gegen die Verarbeitung</li>
                            <li>Datenübertragbarkeit</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Kontakt</h2>
                        <p className="text-gray-300">
                            Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten können Sie uns jederzeit kontaktieren:
                        </p>
                        <p className="text-gray-300 mt-2">
                            E-Mail: datenschutz@tripvega.com
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
