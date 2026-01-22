import Link from "next/link";
import { LandingBackground } from "@/components/features/LandingBackground";

export const metadata = {
    title: "About Us | TripVega",
    description: "Learn more about TripVega, our mission, and our team.",
};

export default function AboutPage() {
    return (
        <div className="relative min-h-screen pt-32 pb-20 px-6 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                {/* Reusing LandingBackground for consistency if desired, or simple gradient */}
                {/* For simple pages, we can stick to bg-background or add a subtle gradient */}
                <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        We Make Travel <span className="text-primary">Unforgettable</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        TripVega is your intelligent companion for discovering the world's best experiences.
                        We connect you with unforgettable adventures, seamless booking, and personalized recommendations.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700">
                        <img
                            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
                            alt="Travel Adventure"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center space-y-6">
                        <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            We believe that travel is the only thing you buy that makes you richer. Our mission is to make the world accessible to everyone by curating the best tours and activities from around the globe.
                        </p>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Whether you're looking for a thrill-seeking adventure, a cultural immersion, or a relaxing getaway, TripVega helps you find exactly what you're looking for.
                        </p>

                        <div className="pt-4">
                            <Link href="/search" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-primary rounded-full hover:bg-primary/90 hover:shadow-lg hover:-translate-y-1">
                                Start Exploring
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-surface border border-theme p-8 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                            <span className="material-symbols-outlined text-3xl">public</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Global Reach</h3>
                        <p className="text-muted-foreground">
                            Access to over 300,000 experiences in 2,500+ destinations worldwide through our partner network.
                        </p>
                    </div>
                    <div className="bg-surface border border-theme p-8 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                        <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 text-secondary">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Trusted & Secure</h3>
                        <p className="text-muted-foreground">
                            Book with confidence. Secure payments and verified reviews ensure a safe and reliable experience.
                        </p>
                    </div>
                    <div className="bg-surface border border-theme p-8 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                            <span className="material-symbols-outlined text-3xl">smart_toy</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">AI Powered</h3>
                        <p className="text-muted-foreground">
                            Our intelligent algorithms help you find the perfect trip tailored to your interests and preferences.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
