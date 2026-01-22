# Viator Full + Booking Access - Implementation Roadmap

> **Projekt**: TripVega - Viator Ingestion Model Integration
> **Entscheidung**: Ingestion Model (statt Real-Time)
> **Geschätzter Aufwand**: 6-7 Arbeitstage
> **Ziel**: Viator-Zertifizierung für Full + Booking Access

---

## 📋 Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 0: Entscheidungen & Questionnaire           [~1 Stunde] │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 1: Supabase Database Setup                  [~4 Stunden]│
├─────────────────────────────────────────────────────────────────┤
│  PHASE 2: Ingestion Pipeline (Sync Jobs)           [~2 Tage]   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 3: Frontend Umbau (DB statt API)            [~1 Tag]    │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 4: Booking Flow Implementation              [~2-3 Tage] │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 5: Compliance & Finishing                   [~0.5 Tag]  │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 6: Testing & Viator Zertifizierung          [~1-2 Tage] │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡️ Parallel-Workflow (Husein & Mert)

Nach **Phase 1 (Setup)** können beide Entwickler parallel arbeiten:

| Husein (Backend Focus) | Mert (Frontend Focus) |
|------------------------|-----------------------|
| Startet mit **Phase 2** (Ingestion) | Startet mit **Phase 4** (Booking Logic) |
| Baut Cron-Jobs & Sync | Baut Checkout & Payment UI |
| Ziel: DB mit Daten füllen | Ziel: Booking Flow mit *einem* Test-Produkt fertigstellen |
| **Blocker**: Keine | **Workaround**: Nutzt Hardcoded Product-ID zum Testen |

---

## PHASE 0: Entscheidungen & Questionnaire
**Aufwand**: ~1 Stunde
**Status**: ✅ Abgeschlossen
**Blockiert**: Keine

### Aufgaben

- [ ] **0.1** Payment Solution wählen
  - [ ] Option A: **iframe** (empfohlen) - SAQ A Self-Assessment
  - [ ] Option B: API Payments - PCI DSS AOC erforderlich

- [ ] **0.2** Product Catalog wählen
  - [ ] Option A: **Curated Subset** (empfohlen) - Viator kuratiert
  - [ ] Option B: Full Catalog - Alle Produkte

- [ ] **0.3** Google Places API Zugang bestätigen
  - [ ] Ja - Eigener Zugang vorhanden
  - [ ] Nein - Nur Viator-Locations nutzen

- [ ] **0.4** Questionnaire finalisieren
  - Datei: `docs/VIATOR_QUESTIONNAIRE_DRAFT.md`
  - Senden an: affiliateapi@tripadvisor.com

### Deliverables
- Ausgefülltes Questionnaire
- Klare Entscheidungen dokumentiert

---

## PHASE 1: Supabase Database Setup
**Aufwand**: ~4 Stunden
**Abhängigkeit**: Phase 0 abgeschlossen
**Status**: ✅ Abgeschlossen (2026-01-23)

### Aufgaben

- [ ] **1.1** Supabase lokal installieren
  ```bash
  # Docker-basiert
  npx supabase init
  npx supabase start
  ```

- [ ] **1.2** Datenbank-Schema erstellen

  #### Tabellen (Prisma Schema):
  
  | Tabelle | Beschreibung | Sync-Frequenz |
  |---------|--------------|---------------|
  | `products` | Alle Viator-Produkte | 20 min |
  | `availability_schedules` | Verfügbarkeit & Preise | 20 min |
  | `destinations` | Reiseziele | Wöchentlich |
  | `tags` | Produkt-Tags | Wöchentlich |
  | `locations` | Orte/Locations | Monatlich |
  | `attractions` | Attraktionen | Wöchentlich |
  | `reviews` | Bewertungen | Wöchentlich |
  | `booking_questions` | Buchungsfragen | Monatlich |
  | `exchange_rates` | Wechselkurse | Täglich |
  | `bookings` | Unsere Buchungen | Live |
  | `sync_logs` | Sync-Status | - |

- [ ] **1.3** Prisma Setup
  ```bash
  npm install @prisma/client prisma
  npx prisma init
  ```

- [ ] **1.4** Verbindung testen

### Deliverables
- Laufende Supabase-Instanz
- Prisma Schema definiert
- Migrationen ausgeführt

---

## PHASE 2: Ingestion Pipeline (Sync Jobs)
**Aufwand**: ~2 Tage
**Abhängigkeit**: Phase 1 abgeschlossen
**Status**: 🟠 In Arbeit (Blocked by API Permissions)

### Aufgaben

#### 2.1 Products Sync (Alle 20 Minuten)
- [x] **2.1.1** `/products/modified-since` Endpoint aufrufen (403 Forbidden)
- [/] **2.1.2** `cursor` Parameter korrekt verwenden
- [ ] **2.1.3** Produkte in DB upserten
- [ ] **2.1.4** Sync-Log schreiben
- [ ] **2.1.5** Cron-Job einrichten (alle 20 min)

#### 2.2 Availability Sync (Alle 20 Minuten)
- [ ] **2.2.1** `/availability/schedules/modified-since` Endpoint aufrufen
- [ ] **2.2.2** `cursor` Parameter verwenden
- [ ] **2.2.3** Availability in DB upserten
- [ ] **2.2.4** Cron-Job einrichten (alle 20 min)

#### 2.3 Auxiliary Data Sync
- [ ] **2.3.1** `/destinations` - Wöchentlicher Sync
- [ ] **2.3.2** `/products/tags` - Wöchentlicher Sync
- [ ] **2.3.3** `/locations/bulk` - Monatlicher Sync
- [ ] **2.3.4** `/attractions/search` - Wöchentlicher Sync
- [ ] **2.3.5** `/reviews/product` - Wöchentlicher Sync
- [ ] **2.3.6** `/products/booking-questions` - Monatlicher Sync
- [ ] **2.3.7** `/exchange-rates` - Täglicher Sync (expiry-based)

#### 2.4 Booking Cancellation Sync (Alle 3 Minuten)
- [ ] **2.4.1** `/bookings/modified-since` Endpoint aufrufen
- [ ] **2.4.2** Stornierungen in DB markieren
- [ ] **2.4.3** `/bookings/modified-since/acknowledge` innerhalb 5 Min aufrufen
- [ ] **2.4.4** Cron-Job einrichten (alle 3 min)

### Sync-Frequenz Übersicht

| Endpoint | Frequenz | Cron Expression |
|----------|----------|-----------------|
| `/products/modified-since` | 20 min | `*/20 * * * *` |
| `/availability/schedules/modified-since` | 20 min | `*/20 * * * *` |
| `/bookings/modified-since` | 3 min | `*/3 * * * *` |
| `/exchange-rates` | Täglich | `0 0 * * *` |
| `/destinations` | Wöchentlich | `0 0 * * 0` |
| `/products/tags` | Wöchentlich | `0 1 * * 0` |
| `/reviews/product` | Wöchentlich | `0 2 * * 0` |
| `/locations/bulk` | Monatlich | `0 0 1 * *` |
| `/products/booking-questions` | Monatlich | `0 0 1 * *` |

### Deliverables
- Alle Sync-Jobs implementiert
- Daten in Supabase vorhanden
- Sync-Logs für Monitoring

---

## PHASE 3: Frontend Umbau
**Aufwand**: ~1 Tag
**Abhängigkeit**: Phase 2 abgeschlossen (Daten in DB)
**Status**: ⏳ Ausstehend

### Aufgaben

#### 3.1 Suche umbauen
- [ ] **3.1.1** `/api/search` Route ändern: DB statt Viator API
- [ ] **3.1.2** Volltextsuche in Supabase implementieren
- [ ] **3.1.3** Filter hinzufügen (Preis, Dauer, Rating)
- [ ] **3.1.4** `/products/search` API-Calls entfernen

#### 3.2 Produktseiten umbauen
- [ ] **3.2.1** `/api/activity/[id]` Route ändern: DB statt API
- [ ] **3.2.2** `/products/{product-code}` API-Calls entfernen
- [ ] **3.2.3** Availability aus DB laden

#### 3.3 Reviews anzeigen
- [ ] **3.3.1** Reviews aus DB laden
- [ ] **3.3.2** Provider anzeigen: "Based on Viator and Tripadvisor reviews"

### ⚠️ Kritische Änderungen
Diese API-Calls **MÜSSEN entfernt** werden (verboten bei Ingestion):
- ❌ `/products/{product-code}` real-time
- ❌ `/availability/schedules/{product-code}` real-time
- ❌ `/products/search` für Suche (nur noch aus DB)

### Deliverables
- Suche funktioniert aus DB
- Produktseiten laden aus DB
- Keine verbotenen API-Calls mehr

---

## PHASE 4: Booking Flow Implementation
**Aufwand**: ~2-3 Tage
**Abhängigkeit**: Phase 3 abgeschlossen
**Status**: ⏳ Ausstehend

### Aufgaben

#### 4.1 Availability Check
- [ ] **4.1.1** `/api/availability/check` Route erstellen
- [ ] **4.1.2** Aufrufen wenn User Datum + Passagiere wählt
- [ ] **4.1.3** Aufrufen direkt vor Buchung (Preis-Verifikation)
- [ ] **4.1.4** Preisänderungen dem User kommunizieren

#### 4.2 Booking Questions
- [ ] **4.2.1** Buchungsfragen aus DB laden
- [ ] **4.2.2** Dynamisches Formular erstellen
- [ ] **4.2.3** Antworten validieren

#### 4.3 Cart Hold
- [ ] **4.3.1** `/api/bookings/hold` Route erstellen
- [ ] **4.3.2** Vor Zahlungseingabe aufrufen
- [ ] **4.3.3** Timestamps überwachen (Hold erneuern wenn nötig)

#### 4.4 Booking
- [ ] **4.4.1** `/api/bookings/book` Route erstellen
- [ ] **4.4.2** Buchungsstatus aus Response prüfen
- [ ] **4.4.3** Viator Voucher dem User anzeigen
- [ ] **4.4.4** Buchung in DB speichern

#### 4.5 Payment Integration (iframe)
- [ ] **4.5.1** Viator Payment iFrame einbinden (JavaScript Library)
- [ ] **4.5.2** SAQ A Self-Assessment Formular ausfüllen
- [x] ~~`/v1/checkoutsessions/{sessionToken}/paymentaccounts`~~ → **NICHT verwendet** (nur bei API Payments)

#### 4.6 Booking Status
- [ ] **4.6.1** `/api/bookings/status` für pending Buchungen
- [ ] **4.6.2** Stündliche Checks für unbestätigte Buchungen

#### 4.7 Stornierung
- [ ] **4.7.1** `/api/bookings/cancel-quote` Route
- [ ] **4.7.2** `/api/bookings/cancel` Route
- [ ] **4.7.3** Rückerstattungsbetrag anzeigen vor Stornierung

### Booking Flow Diagram

```
User wählt Produkt
        ↓
User wählt Datum + Passagiere
        ↓
┌─────────────────────────┐
│  /availability/check    │  ← Preis & Verfügbarkeit prüfen
└─────────────────────────┘
        ↓
Booking Questions ausfüllen
        ↓
┌─────────────────────────┐
│  /bookings/cart/hold    │  ← Verfügbarkeit reservieren
└─────────────────────────┘
        ↓
Zahlungsdaten eingeben (iframe)
        ↓
┌─────────────────────────┐
│  /availability/check    │  ← Preis nochmal prüfen!
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│  /bookings/cart/book    │  ← Buchung abschließen
└─────────────────────────┘
        ↓
Voucher anzeigen ✅
```

### Deliverables
- Vollständiger Booking-Flow
- Payment iframe integriert
- Stornierung möglich

---

## PHASE 5: Compliance & Finishing
**Aufwand**: ~0.5 Tag
**Abhängigkeit**: Phase 4 abgeschlossen
**Status**: ⏳ Ausstehend

### Aufgaben

#### 5.1 SEO Compliance
- [ ] **5.1.1** `noindex` Meta-Tags für Review-Seiten
- [ ] **5.1.2** `noindex` Meta-Tags für Attractions
- [ ] **5.1.3** Robots.txt prüfen

#### 5.2 Review Provider
- [ ] **5.2.1** Anzeige: "Based on Viator and Tripadvisor reviews"
- [ ] **5.2.2** Korrekter Provider pro Review (Viator ODER Tripadvisor)

#### 5.3 API Timeout
- [ ] **5.3.1** 120 Sekunden Timeout für alle Viator API-Calls
- [ ] **5.3.2** Fetch-Konfiguration anpassen

#### 5.4 Error Handling
- [ ] **5.4.1** Booking-Fehler graceful behandeln
- [ ] **5.4.2** Bei Timeout: `/bookings/status` prüfen vor Re-Booking

### Deliverables
- Alle Compliance-Anforderungen erfüllt
- 120s Timeout konfiguriert

---

## PHASE 6: Testing & Viator Zertifizierung
**Aufwand**: ~1-2 Tage + Wartezeit
**Abhängigkeit**: Alle Phasen abgeschlossen
**Status**: ⏳ Ausstehend

### Aufgaben

#### 6.1 Internes Testing
- [ ] **6.1.1** Sync-Jobs manuell testen
- [ ] **6.1.2** Suche aus DB testen
- [ ] **6.1.3** Booking-Flow End-to-End testen
- [ ] **6.1.4** Stornierung testen
- [ ] **6.1.5** Error-Cases testen

#### 6.2 Viator Sandbox Testing
- [ ] **6.2.1** Test-Buchungen in Sandbox durchführen
- [ ] **6.2.2** Alle Endpoints verifizieren

#### 6.3 Zertifizierung einreichen
- [ ] **6.3.1** Backend-Checks bestanden
- [ ] **6.3.2** Frontend-Checks bestanden
- [ ] **6.3.3** Production-Credentials erhalten

### Deliverables
- Alle Tests bestanden
- Viator-Zertifizierung abgeschlossen
- Production-Zugang erhalten

---

## 📊 Zeitplan (Optimistisch)

| Tag | Phase | Aufgaben |
|-----|-------|----------|
| Tag 1 | Phase 0 + 1 | Entscheidungen + Supabase Setup |
| Tag 2 | Phase 2 | Products & Availability Sync |
| Tag 3 | Phase 2 | Auxiliary Data + Bookings Sync |
| Tag 4 | Phase 3 | Frontend Umbau |
| Tag 5 | Phase 4 | Booking Flow (Teil 1) |
| Tag 6 | Phase 4 | Booking Flow (Teil 2) + Payment |
| Tag 7 | Phase 5 + 6 | Compliance + Testing |
| Tag 8+ | - | Viator Zertifizierung (Wartezeit) |

---

## ❓ Offene Entscheidungen

| # | Entscheidung | Optionen | Status |
|---|--------------|----------|--------|
| 1 | Payment Solution | ✅ **iframe** | ✅ Entschieden |
| 2 | Product Catalog | ✅ **Full Catalog** | ✅ Entschieden |
| 3 | Google Places API | ❌ **Nein** | ✅ Entschieden |

---

## 📁 Relevante Dateien

| Datei | Beschreibung |
|-------|--------------|
| `docs/VIATOR_INTEGRATION_MASTER.md` | Haupt-Referenzdokument |
| `docs/VIATOR_QUESTIONNAIRE_DRAFT.md` | Questionnaire für Viator |
| `docs/ARCHITECTURE.md` | System-Architektur |
| `lib/api/viator-client.ts` | Aktueller Viator Client |

---

*Erstellt: 2026-01-15*
*Letzte Aktualisierung: 2026-01-15*
