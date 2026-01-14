import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
});

export const registerSchema = z.object({
    firstName: z.string().min(1, "Vorname ist erforderlich"),
    lastName: z.string().min(1, "Nachname ist erforderlich"),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z
        .string()
        .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
        .regex(/[A-Z]/, "Passwort muss einen Großbuchstaben enthalten")
        .regex(/[a-z]/, "Passwort muss einen Kleinbuchstaben enthalten")
        .regex(/[0-9]/, "Passwort muss eine Zahl enthalten")
        .regex(/[^A-Za-z0-9]/, "Passwort muss ein Sonderzeichen enthalten"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
});

export const bookingSchema = z.object({
    activityId: z.string(),
    date: z.string(),
    timeSlot: z.string().optional(),
    participants: z.object({
        adults: z.number().min(1),
        children: z.number().default(0),
        infants: z.number().default(0),
    }),
    customer: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
    }),
    specialRequirements: z.string().optional(),
});
