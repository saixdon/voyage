---
name: ui-interaction-audit
description: Analysiert und testet interaktive UI-Elemente (Buttons, Links). Verifiziert, dass Handler (onClick) existieren, hinterfragt den UX-Zweck ("Warum ist das hier?") und führt Live-Browsertests durch, um die Funktionalität zu beweisen.
---

# UI Interaction & Purpose Audit Skill

Dieser Skill stellt sicher, dass Buttons und interaktive Elemente in der `implementieren`-Sektion funktional sind und einen klaren Zweck erfüllen.

## 1. Phase: Statische Code-Analyse (Der "Deko-Check")

Bevor du den Browser öffnest, analysiere den Quellcode der Komponente:

1.  **Event-Handler-Suche:**
    *   Suche nach `<button>`, `<a>`, oder `<div>` mit `role="button"`.
    *   **Prüfung:** Hat das Element ein `onClick`, `onPress` oder `action` Attribut?
    *   *Warnung:* Wenn ein Button nur visuelle Klassen (z.B. CSS) hat, aber keine Logik bindet, markiere ihn als "Potenziell nur Deko".

2.  **Intent & Semantik-Analyse (Das "Warum"):**
    *   Lese den Label-Text oder das Icon des Buttons (z.B. "Speichern", "Abbrechen", "Mehr laden").
    *   **Hinterfrage:** Passt die gebundene Funktion zum Label?
        *   *Beispiel:* Ein Button "Löschen" sollte eine Funktion aufrufen, die `delete` oder `remove` im Namen hat, nicht `navigate`.
    *   **Kontext-Check:** Macht dieser Button an dieser Stelle im UI Sinn? (z.B. Ein "Kaufen"-Button auf einer "Profil bearbeiten"-Seite ist verdächtig).

## 2. Phase: Dynamische Validierung (Der "Funktions-Check")

Nutze den Browser-Agenten (`/browser`), um die Seite zu laden (z.B. `localhost:3000`).

1.  **Sichtbarkeits-Test:** Ist der Button klickbar und nicht durch andere Elemente verdeckt (`z-index` Probleme)?
2.  **Live-Interaktion:**
    *   Klicke auf den Button.
    *   **Beobachte die Reaktion:**
        *   Hat sich die URL geändert?
        *   Gab es einen API-Call (Network Tab)?
        *   Erschien eine Toast-Notification oder ein Modal?
        *   Hat sich der Zustand der Seite geändert (z.B. Lade-Spinner)?
3.  **Fehlerfall-Test (Optional):** Was passiert, wenn man den Button klickt, aber die Eingabedaten fehlen?

## 3. Phase: Reporting & Kritik

Erstelle einen Bericht (Artifact) mit dem Titel `BUTTON_AUDIT.md`:

*   **Tabelle aller Buttons:** Spalten für [Name/Label] | [Ort] | [Funktion] | [Status: Funktional/Deko/Defekt].
*   **UX-Kritik:** Wenn ein Button überflüssig wirkt oder der Zweck unklar ist, schlage vor, ihn zu entfernen oder umzubenennen.
*   **Verbesserungsvorschläge:** Z.B. Hinzufügen von `aria-label` für Accessibility oder Loading-States (`disabled={isLoading}`).

## Protokolle

*   **Keine Annahmen:** Wenn ein Button `onClick={() => {}}` (leere Funktion) enthält, gilt er als **DEFEKT**, nicht als "fertig".
*   **Sicherheits-Check:** Prüfe, ob destruktive Buttons (Löschen) eine Bestätigung erfordern.
