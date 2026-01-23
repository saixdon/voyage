# Viator API Endpoint Testing Task

> **Erstellt**: 2026-01-21
> **Basierend auf**: [VIATOR_QUESTIONNAIRE_DRAFT.md](../VIATOR_QUESTIONNAIRE_DRAFT.md)
> **Roadmap**: [VIATOR_IMPLEMENTATION_ROADMAP.md](../VIATOR_IMPLEMENTATION_ROADMAP.md)
> **Ziel**: Alle im Questionnaire definierten Viator API Endpunkte systematisch testen

---

## 📋 Übersicht

Diese Task dokumentiert alle Viator API Endpunkte, die in TripVega verwendet werden sollen, und definiert Testfälle für jeden Endpunkt. Das Testen dieser Endpunkte ist kritisch, um sicherzustellen, dass die Integration vor dem Go-Live korrekt funktioniert.

### Verwendetes Datenmodell: **Ingestion Model**
- Produkte werden über `/products/modified-since` ingested (stündlich)
- Verfügbarkeit wird über `/availability/schedules/modified-since` ingested (stündlich)
- Suche erfolgt aus eigener Datenbank (Supabase)

---

## 🔗 Verknüpfung: Roadmap ↔ Endpoint Testing

> **Wichtig**: Die Endpoint-Tests werden **parallel zur Implementierung** durchgeführt, nicht danach!

### Mapping: Roadmap-Phasen → Test-Phasen

| Roadmap Phase | Beschreibung | Test-Phase | Verantwortlich | Endpoints |
|---------------|--------------|------------|----------------|-----------|
| **Phase 1** | Supabase Setup | - | Beide | Keine API-Calls |
| **Phase 2** | Ingestion Pipeline | Test-Phase 1 + 4 | 👤 Husein | modified-since, exchange-rates, tags, etc. |
| **Phase 3** | Frontend Umbau | - | Beide | Keine neuen API-Calls |
| **Phase 4** | Booking Flow | Test-Phase 2 + 3 | 👤 Mert | availability/check, bookings/*, reviews |
| **Phase 5** | Compliance | - | Beide | Verification |
| **Phase 6** | Testing & Zertifizierung | Alle Phasen | Beide | E2E Verification |

### Arbeits-Workflow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Tag 1-3: Phase 2 (Ingestion)                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Husein implementiert + testet:                                         │ │
│  │  ✓ /products/modified-since                                             │ │
│  │  ✓ /availability/schedules/modified-since                               │ │
│  │  ✓ /exchange-rates, /destinations, /tags, etc.                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│  Tag 4: Phase 3 (Frontend)                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Beide gemeinsam: Frontend auf DB-Daten umstellen                       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│  Tag 5-6: Phase 4 (Booking Flow)                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Mert implementiert + testet:                                           │ │
│  │  ✓ /availability/check                                                  │ │
│  │  ✓ /bookings/cart/hold + /bookings/cart/book                            │ │
│  │  ✓ /bookings/cancel-quote + /bookings/cancel                            │ │
│  │  ✓ /reviews/product                                                     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│  Tag 7+: Phase 6 (Testing)                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Beide: E2E Tests, alle Checklisten abhaken                             │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Aufgabenteilung (2 Entwickler)

Die Aufgaben sind fair nach **Komplexität**, **Anzahl der Testfälle** und **thematischem Fokus** aufgeteilt:

### 👤 Husein: **Backend & Ingestion Focus**
> Schwerpunkt: Daten-Ingestion, Caching, Referenzdaten

| Endpunkt | Phase | Priorität | Testfälle |
|----------|-------|-----------|-----------|
| `/products/modified-since` | 1 | 🔴 Hoch | 6 |
| `/availability/schedules/modified-since` | 1 | 🔴 Hoch | 5 |
| `/exchange-rates` | 4 | 🔴 Hoch | 4 |
| `/products/tags` | 4 | 🟢 Niedrig | 3 |
| `/products/booking-questions` | 4 | 🟡 Mittel | 3 |
| `/locations/bulk` | 4 | 🟡 Mittel | 3 |
| `/destinations` | 4 | 🟡 Mittel | 3 |
| `/suppliers/search/product-codes` | 4 | 🟢 Niedrig | 2 |
| `/attractions/search` | 4 | 🟢 Niedrig | 2 |
| `/attractions/{attraction-id}` | 4 | 🟢 Niedrig | 2 |
| `/products/bulk` | 5 | 🟢 Niedrig | 2 |

**Zusammenfassung Husein:**
| Metrik | Wert |
|--------|------|
| Endpunkte | 11 |
| 🔴 Hoch-Priorität | 3 |
| 🟡 Mittel-Priorität | 3 |
| 🟢 Niedrig-Priorität | 5 |
| Testfälle gesamt | **35** |

**Kernaufgaben:**
- [ ] Ingestion-Pipeline aufsetzen (Cron-Jobs)
- [ ] Supabase-Schemas für Produkte & Verfügbarkeit
- [ ] Caching-Strategie für Referenzdaten
- [ ] Error Handling & Retry-Logik

---

### 👤 Mert: **Booking Flow & User-Facing Focus**
> Schwerpunkt: Real-Time APIs, Buchungen, Stornierungen, Reviews

| Endpunkt | Phase | Priorität | Testfälle |
|----------|-------|-----------|-----------|
| `/availability/check` | 2 | 🔴 Hoch | 6 |
| `/bookings/cart/hold` | 2 | 🔴 Hoch | 4 |
| `/bookings/cart/book` | 2 | 🔴 Hoch | 4 |
| `/bookings/modified-since` | 3 | 🔴 Hoch | 3 |
| `/bookings/status` | 3 | 🟡 Mittel | 3 |
| `/bookings/{booking-reference}/cancel-quote` | 3 | 🟡 Mittel | 3 |
| `/bookings/{booking-reference}/cancel` | 3 | 🟡 Mittel | 3 |
| `/bookings/cancel-reasons` | 3 | 🟢 Niedrig | 2 |
| `/reviews/product` | 4 | 🟡 Mittel | 4 |
| `/availability/schedules/bulk` | 5 | 🟢 Niedrig | 1 |

**Zusammenfassung Mert:**
| Metrik | Wert |
|--------|------|
| Endpunkte | 10 |
| 🔴 Hoch-Priorität | 4 |
| 🟡 Mittel-Priorität | 4 |
| 🟢 Niedrig-Priorität | 2 |
| Testfälle gesamt | **33** |

**Kernaufgaben:**
- [ ] Booking Flow End-to-End
- [ ] Stornierungslogik implementieren
- [ ] Preisänderungs-Kommunikation
- [ ] Review-Anzeige mit Provider-Info

---

### 📊 Vergleich der Aufteilung

| Metrik | Husein | Mert |
|--------|--------|------|
| Endpunkte | 11 | 10 |
| Testfälle | 35 | 33 |
| 🔴 Hoch | 3 | 4 |
| 🟡 Mittel | 3 | 4 |
| 🟢 Niedrig | 5 | 2 |
| **Fokus** | Backend/Daten | User-Facing/Buchung |

> **Hinweis**: Husein hat mehr Endpunkte, aber diese sind überwiegend einfacher (Cached/Referenzdaten). Mert hat weniger Endpunkte, aber diese sind komplexer (Real-Time Booking Flow mit kritischen User-Interaktionen).

### 🤝 Gemeinsame Aufgaben
- [ ] Test-Infrastruktur aufsetzen (Sandbox API Key, Logging)
- [ ] Code Reviews gegenseitig durchführen
- [ ] Integration Testing zwischen Ingestion und Booking
- [ ] Dokumentation aktualisieren

---

## 🧪 Testplan

### Phase 1: Ingestion Endpunkte (Kritisch)

#### 1.1 `/products/modified-since`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🔴 Hoch |
| **Frequenz** | Stündlich |
| **Zweck** | Full Product Content Ingestion |

**Testfälle:**
- [x] Initialer Abruf ohne `cursor` Parameter funktioniert (Failed with 403 Forbidden)
- [ ] Cursor-basierte Pagination funktioniert korrekt
- [ ] Response enthält vollständige Produktdaten (Titel, Beschreibung, Bilder, etc.)
- [ ] Leerer Response wenn keine Änderungen seit letztem Abruf
- [/] Error Handling bei API-Timeout (120s)
- [/] Daten werden korrekt in Supabase gespeichert (Logic ready, blocked by API)

**Beispiel Request:**
```bash
curl -X GET "https://api.viator.com/partner/products/modified-since?modified-since=YYYY-MM-DDTHH:MM:SS" \
  -H "exp-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"
```

---

#### 1.2 `/availability/schedules/modified-since`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🔴 Hoch |
| **Frequenz** | Stündlich |
| **Zweck** | Verfügbarkeits- und Pricing-Schedules |

**Testfälle:**
- [ ] Initialer Abruf funktioniert
- [ ] Cursor-basierte Pagination funktioniert
- [ ] Verfügbarkeitsslots werden korrekt geparst
- [ ] Preise werden korrekt extrahiert
- [ ] Daten werden in Supabase gespeichert

---

### Phase 2: Real-Time Endpunkte (Booking Flow)

#### 2.1 `/availability/check`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🔴 Hoch |
| **Frequenz** | Real-time (User-initiiert) |
| **Zweck** | Echtzeitverfügbarkeit prüfen |

**Testfälle:**
- [x] Request mit spezifischem Datum funktioniert (403 Forbidden - Blocked)
- [ ] Request mit Passenger Mix (Age Bands) funktioniert
- [ ] Verfügbare Zeitslots werden korrekt zurückgegeben
- [ ] Preise werden korrekt angezeigt
- [ ] "Ausgebucht" Status wird erkannt
- [ ] Preisänderungen werden erkannt und kommuniziert

**Beispiel Request:**
```json
{
  "productCode": "PRODUCT_CODE",
  "travelDate": "2026-02-15",
  "paxMix": [
    { "ageBand": "ADULT", "numberOfTravelers": 2 }
  ]
}
```

---

#### 2.2 `/bookings/cart/hold`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🔴 Hoch |
| **Frequenz** | Real-time |
| **Zweck** | Buchung reservieren vor Zahlung |

**Testfälle:**
- [ ] Cart Hold wird erfolgreich erstellt
- [ ] Hold-Dauer wird korrekt behandelt
- [ ] Response enthält alle benötigten Booking-Details
- [ ] Error Handling bei ungültigen Daten

---

#### 2.3 `/bookings/cart/book`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🔴 Hoch |
| **Frequenz** | Real-time |
| **Zweck** | Buchung abschließen |

**Testfälle:**
- [ ] Buchung wird erfolgreich abgeschlossen
- [ ] Booking Reference wird zurückgegeben
- [ ] Bestätigungs-E-Mail wird ausgelöst (Viator-seitig)
- [ ] Error Handling bei Zahlungsproblemen

---

### Phase 3: Booking Management Endpunkte

#### 3.1 `/bookings/status`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟡 Mittel |
| **Frequenz** | Stündlich (für pending Bookings) |
| **Zweck** | Status von Buchungen prüfen |

**Testfälle:**
- [ ] Status-Abfrage für bestehende Buchung funktioniert
- [ ] Verschiedene Status werden korrekt erkannt (CONFIRMED, PENDING, CANCELLED)
- [ ] Bulk-Abfrage mehrerer Buchungen funktioniert

---

#### 3.2 `/bookings/modified-since`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🔴 Hoch |
| **Frequenz** | Alle 3 Minuten |
| **Zweck** | Supplier-Stornierungen erkennen |

**Testfälle:**
- [ ] Geänderte Buchungen werden erkannt
- [ ] Stornierungen werden korrekt identifiziert
- [ ] Benutzer wird über Änderungen informiert

---

#### 3.3 `/bookings/{booking-reference}/cancel-quote`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟡 Mittel |
| **Frequenz** | Real-time |
| **Zweck** | Stornierungskosten anzeigen |

**Testfälle:**
- [ ] Cancel Quote wird korrekt abgerufen
- [ ] Refund-Betrag wird angezeigt
- [ ] Stornierungsfrist wird kommuniziert

---

#### 3.4 `/bookings/{booking-reference}/cancel`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟡 Mittel |
| **Frequenz** | Real-time |
| **Zweck** | Buchung stornieren |

**Testfälle:**
- [ ] Stornierung wird erfolgreich durchgeführt
- [ ] Refund wird verarbeitet
- [ ] Bestätigung wird zurückgegeben

---

#### 3.5 `/bookings/cancel-reasons`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟢 Niedrig |
| **Frequenz** | Monatlich (cached) |
| **Zweck** | Stornierungsgründe abrufen |

**Testfälle:**
- [ ] Liste der Stornierungsgründe wird abgerufen
- [ ] Daten werden in Cache gespeichert

---

### Phase 4: Referenzdaten Endpunkte (Cached)

#### 4.1 `/products/tags`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟢 Niedrig |
| **Frequenz** | Wöchentlich |
| **Zweck** | Produkt-Tags für Filterung |

**Testfälle:**
- [x] Tags werden erfolgreich abgerufen ✅ (1257 tags synced)
- [x] Cache-Mechanismus funktioniert
- [ ] Tags können für Filterung verwendet werden

---

#### 4.2 `/products/booking-questions`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟡 Mittel |
| **Frequenz** | Monatlich |
| **Zweck** | Buchungsfragen für Checkout |

**Testfälle:**
- [ ] Buchungsfragen werden abgerufen
- [ ] Unterschiedliche Fragetypen werden erkannt
- [ ] Antworten werden im Booking-Flow gesammelt

---

#### 4.3 `/locations/bulk`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟡 Mittel |
| **Frequenz** | Monatlich + On-Demand |
| **Zweck** | Standortdaten abrufen |

**Testfälle:**
- [ ] Bulk-Abruf von Locations funktioniert
- [ ] Neue Locations können on-demand abgerufen werden
- [ ] Daten werden korrekt gecached

---

#### 4.4 `/exchange-rates`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🔴 Hoch |
| **Frequenz** | Täglich (basierend auf Expiry) |
| **Zweck** | Wechselkurse für Währungsumrechnung |

**Testfälle:**
- [x] Wechselkurse werden abgerufen ✅ (1296 rates via POST)
- [x] Expiry Timestamp wird respektiert
- [x] EUR-Umrechnung funktioniert korrekt
- [x] Cache wird bei Expiry aktualisiert

---

#### 4.5 `/reviews/product`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟡 Mittel |
| **Frequenz** | Wöchentlich |
| **Zweck** | Produktbewertungen anzeigen |

**Testfälle:**
- [ ] Reviews werden pro Produkt abgerufen
- [ ] Provider (Viator/Tripadvisor) wird erkannt
- [ ] Rating-Berechnung ist korrekt
- [ ] `noindex` Meta-Tag ist gesetzt

---

#### 4.6 `/suppliers/search/product-codes`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟢 Niedrig |
| **Frequenz** | Wöchentlich |
| **Zweck** | Supplier-Informationen |

**Testfälle:**
- [ ] Supplier-Daten werden abgerufen
- [ ] Verknüpfung zu Produkten funktioniert

---

#### 4.7 `/destinations`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟡 Mittel |
| **Frequenz** | Wöchentlich |
| **Zweck** | Destinationsliste |

**Testfälle:**
- [x] Alle Destinationen werden abgerufen (Connectivity verified - 400 Bad Request on missing params instead of 403)
- [ ] Destination-IDs können für Filterung verwendet werden
- [ ] Hierarchie (Land > Stadt) wird erkannt

---

#### 4.8 `/attractions/search`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟢 Niedrig |
| **Frequenz** | Wöchentlich |
| **Zweck** | Attraktionen suchen |

**Testfälle:**
- [ ] Attraktionen-Suche funktioniert
- [ ] `noindex` Meta-Tag ist für Attraction-Seiten gesetzt

---

#### 4.9 `/attractions/{attraction-id}`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟢 Niedrig |
| **Frequenz** | Wöchentlich |
| **Zweck** | Attraktions-Details |

**Testfälle:**
- [ ] Einzelne Attraktion kann abgerufen werden
- [ ] Details sind vollständig

---

### Phase 5: Edge Case Endpunkte (Nur bei Bedarf)

#### 5.1 `/products/bulk`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟢 Niedrig |
| **Frequenz** | Nur Edge Cases |
| **Zweck** | Einzelne Produkte abrufen |

**Testfälle:**
- [ ] Bulk-Abruf für max. wenige Produkte funktioniert
- [ ] Wird NICHT für reguläre Ingestion verwendet

---

#### 5.2 `/availability/schedules/bulk`
| Attribut | Wert |
|----------|------|
| **Priorität** | 🟢 Niedrig |
| **Frequenz** | Nur Edge Cases |
| **Zweck** | Einzelne Verfügbarkeiten abrufen |

**Testfälle:**
- [ ] Bulk-Abruf für einzelne Produkte funktioniert

---

## ❌ Nicht verwendete Endpunkte

Folgende Endpunkte werden laut Questionnaire **NICHT** verwendet:

| Endpunkt | Grund |
|----------|-------|
| `/products/{product-code}` | Daten kommen aus Ingestion |
| `/availability/schedules/{product-code}` | Daten kommen aus Ingestion |
| `/products/search` | Suche aus eigener DB |
| `/search/freetext` | Suche aus eigener DB |
| `/v1/checkoutsessions/{sessionToken}/paymentaccounts` | Iframe Solution |
| `/bookings/modified-since/acknowledge` | Nur für Merchant Partners |

---

## 🔧 Test-Infrastruktur

### Voraussetzungen
- [ ] Viator API Key (Sandbox) konfiguriert
- [ ] Supabase-Verbindung steht
- [ ] Cron-Job-Infrastruktur bereit
- [ ] Error Logging konfiguriert

### API-Konfiguration
```env
VIATOR_API_KEY=your_sandbox_api_key
VIATOR_API_URL=https://api.viator.com/partner
VIATOR_API_TIMEOUT=120000
```

### Test-Umgebung
- Sandbox API für alle Tests
- Testbuchungen mit Sandbox-Kreditkarte
- Logging aller API-Calls aktivieren

---

## 📊 Fortschritt

| Phase | Status | Getestet | Gesamt |
|-------|--------|----------|--------|
| Phase 1: Ingestion | 🟡 Blocked | 1 | 2 |
| Phase 2: Real-Time | ⏳ Pending | 0 | 3 |
| Phase 3: Booking Management | ⏳ Pending | 0 | 5 |
| Phase 4: Referenzdaten | 🟠 In Arbeit | 1 | 9 |
| Phase 5: Edge Cases | ⏳ Pending | 0 | 2 |
| **Gesamt** | 🟠 In Arbeit | **2** | **21** |

---

## 📝 Notizen

- **Timeout**: Alle API-Calls müssen 120 Sekunden Timeout haben
- **Cursor Pagination**: `modified-since` Endpunkte verwenden Cursor, nicht Offset
- **Caching**: Referenzdaten müssen gecached werden (Redis/In-Memory)
- **SEO**: Reviews und Attractions dürfen NICHT indexiert werden (`noindex`)
- **PCI Compliance**: Payment über Viator Iframe, keine eigene Zahlungsverarbeitung

---

## ✅ Abnahmekriterien

1. Alle 🔴 Hoch-Priorität Endpunkte funktionieren fehlerfrei
2. Ingestion läuft stündlich ohne Fehler
3. Booking-Flow funktioniert End-to-End
4. Error Handling ist für alle Endpunkte implementiert
5. Logging erfasst alle API-Interaktionen
