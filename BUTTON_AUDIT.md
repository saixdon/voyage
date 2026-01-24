# BUTTON_AUDIT.md

## Zusammenfassung
Dieses Audit wurde basierend auf dem Skill `ui-interaction-audit` durchgeführt. Untersucht wurden die Buttons in der `FAQSection` auf der Startseite.

### Geprüfte Elemente

| Name / Label | Ort | Funktion / Typ | Status |
| :--- | :--- | :--- | :--- |
| **Kontakt Support** (de) / Contact Support (en) | FAQ Sektion (Footer-Nähe) | `<Link href="/kontakt">` | ✅ **Funktional** |
| **Hilfecenter** (de) / Help Center (en) | FAQ Sektion (Footer-Nähe) | `<Link href="/faq">` | ✅ **Funktional** |

### Detaillierte Analyse

#### 1. "Kontakt Support" Button
*   **Visuell:** Sieht aus wie ein primärer Call-to-Action (blauer Hintergrund).
*   **Code-Check:** `<button onClick={undefined} ...>`
*   **Browser-Test:** Klick löst keine Aktion aus. Keine URL-Änderung, keine Modal-Öffnung.
*   **UX-Kritik:** Irreführend. Suggeriert sofortige Hilfe, ist aber funktionslos.

#### 2. "Hilfecenter" Button
*   **Visuell:** Sekundärer Button (Outline Style).
*   **Code-Check:** `<button onClick={undefined} ...>`
*   **Browser-Test:** Klick löst keine Aktion aus.
*   **UX-Kritik:** Suggeriert Link zu einer Knowledge Base oder FAQ-Seite, tut aber nichts.

### Verbesserungsvorschläge

1.  **Funktionalität herstellen:**
    *   **Kontakt:** Verlinken auf `/contact` oder Öffnen eines `mailto:` Links, oder Öffnen eines Intercom/Chat-Widgets.
    *   **Hilfecenter:** Verlinken auf `/help` oder `/faq` (falls eine separate Seite existiert).
2.  **Semantik korrigieren:** Wenn es Links zu anderen Seiten sind, sollten `<a>` (Link) Tags statt `<button>` verwendet werden.
3.  **Code-Anpassung (Vorschlag):**

```tsx
// Vorher
<button className="...">
    {t('contactSupport')}
</button>

// Nachher (Beispiel)
<Link href="/contact" className="...">
    {t('contactSupport')}
</Link>
```

### Nächste Schritte
*   Entscheidung treffen: Wohin sollen diese Buttons führen?
*   Implementierung der Links oder Handler.

### Changelog
- **[25.01.2026] Fix**: Buttons in `FAQSection` wurden durch `Link` Komponenten ersetzt (via `next-intl` Navigation).
    - "Kontakt Support" -> `/kontakt`
    - "Hilfecenter" -> `/faq`
