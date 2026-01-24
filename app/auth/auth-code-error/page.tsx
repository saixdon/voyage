import { useTranslations } from "next-intl";

export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
            <div className="p-8 max-w-md w-full bg-card border border-border rounded-xl shadow-lg text-center">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                <h1 className="text-2xl font-bold mb-2">Login Error</h1>
                <p className="text-muted-foreground mb-6">
                    There was a problem signing you in. The authentication code could not be verified.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Return Home
                </a>
            </div>
        </div>
    );
}
