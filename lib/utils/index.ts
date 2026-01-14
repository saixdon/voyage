// Utility Functions

export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export function formatPrice(amount: number, currency: string = "EUR"): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}
