import Link from "next/link";

export const metadata = {
    title: "FAQ | TripVega",
    description: "Frequently asked questions about booking, payments, and cancellations.",
};

const FAQS = [
    {
        question: "How do I make a booking?",
        answer: "You can easily book activities through our website. Simply search for your desired destination or activity, select your preferred date and number of people, and proceed to checkout."
    },
    {
        question: "Is my payment secure?",
        answer: "Yes, we use industry-standard encryption to protect your payment information. We partner with trusted payment providers to ensure your data is always safe."
    },
    {
        question: "Can I cancel my booking?",
        answer: "Most activities offer free cancellation up to 24 hours before the start time. Please check the specific cancellation policy on the activity page for details."
    },
    {
        question: "When will I receive my confirmation?",
        answer: "You will receive an instant confirmation email with your voucher immediately after successful payment."
    },
    {
        question: "Do I need to print my voucher?",
        answer: "For most activities, a mobile voucher on your phone is sufficient. The activity details will specify if a printed voucher is required."
    },
    {
        question: "Who can I contact if I have problems?",
        answer: "Our customer support team is available 24/7. You can contact us via the contact form on our website or by email at support@tripvega.com."
    },
    {
        question: "Are there group discounts?",
        answer: "Some activities offer discounted rates for larger groups. Please check the pricing details on the specific activity page."
    }
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
                    <p className="text-muted-foreground text-lg">
                        Find answers to common questions about TripVega.
                    </p>
                </div>

                <div className="space-y-6">
                    {FAQS.map((faq, index) => (
                        <div key={index} className="bg-surface border border-theme rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-start gap-3">
                                <span className="text-primary mt-1 material-symbols-outlined">help</span>
                                {faq.question}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed pl-9">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center bg-surface-elevated rounded-3xl p-8 border border-theme">
                    <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
                    <p className="text-muted-foreground mb-6">
                        We are here to help you.
                    </p>
                    <Link
                        href="/kontakt"
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
