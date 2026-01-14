export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <div className="glass p-8 rounded-2xl max-w-md w-full mx-4">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Login</h1>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            E-Mail
                        </label>
                        <input
                            type="email"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Passwort
                        </label>
                        <input
                            type="password"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(43,140,238,0.3)] hover:shadow-[0_0_30px_rgba(43,140,238,0.5)] transition-all transform hover:scale-105"
                    >
                        Anmelden
                    </button>
                </form>
                <p className="text-gray-400 text-sm text-center mt-6">
                    Noch kein Konto?{" "}
                    <a href="/register" className="text-primary hover:underline">
                        Registrieren
                    </a>
                </p>
            </div>
        </div>
    );
}
