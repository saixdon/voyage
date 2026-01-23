# Viator Full + Booking Access - Implementation Roadmap

> **Projekt**: TripVega - Viator Ingestion Model Integration
> **Entscheidung**: Ingestion Model (statt Real-Time)
> **Geschätzter Aufwand**: 6-7 Arbeitstage
> **Ziel**: Viator-Zertifizierung für Full + Booking Access
> **Letzte Aktualisierung**: 2026-01-23

---

## 📋 Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 0: Entscheidungen & Questionnaire           [✅ DONE]   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 1: Supabase Database Setup                  [✅ DONE]   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 2: Ingestion Pipeline (Sync Jobs)           [🟡 75%]    │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 3: viator-client.ts API Integration         [✅ DONE]   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 4: Booking Flow Implementation              [🟡 50%]    │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 5: Compliance & Finishing                   [⏳ TODO]   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 6: Testing & Viator Zertifizierung          [⏳ TODO]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ API Endpoint Implementation Status

### Bereits in `lib/api/viator-client.ts` implementiert

| Endpoint | Funktion | Status |
|----------|----------|--------|
| `/products/search` | `searchViatorProducts()` | ✅ Implementiert |
| `/products/{product-code}` | `getViatorProductDetails()` | ✅ Implementiert |
| `/products/tags` | `fetchViatorTags()` | ✅ Implementiert |
| `/destinations` | `fetchAllDestinations()` | ✅ Implementiert |
| `/availability/check` | `getViatorAvailability()` | ✅ Implementiert |
| `/availability/schedules/bulk` | `getViatorAvailabilitySchedulesBulk()` | ✅ Implementiert |
| `/bookings/cart/hold` | `createViatorCartHold()` | ✅ Implementiert |
| `/bookings/cart/book` | `createViatorBooking()` | ✅ Implementiert |
| `/bookings/status` | `getBookingStatus()` | ✅ Implementiert |
| `/bookings/{ref}/cancel-quote` | `cancelBookingQuote()` | ✅ Implementiert |
| `/bookings/{ref}/cancel` | `cancelBooking()` | ✅ Implementiert |
| `/bookings/cancel-reasons` | `getViatorCancellationReasons()` | ✅ Implementiert |
| `/bookings/modified-since` | `getBookingsModifiedSince()` | ✅ Implementiert |
| `/reviews/product` | `getProductReviews()` | ✅ Implementiert |

### Sync-Skripte (`scripts/sync/`)


| Endpoint | Skript | Status |
|----------|--------|--------|
| `/products/modified-since` | `sync-products.ts` | ✅ Funktioniert |
| `/products/bulk` | `sync-products.ts` | ✅ Funktioniert |
| `/destinations` | `sync-destinations.ts` | ✅ Funktioniert |
| `/products/tags` | `sync-tags.ts` | ✅ Funktioniert |
| `/exchange-rates` | `sync-exchange-rates.ts` | ✅ Funktioniert |
| `/products/booking-questions` | `sync-booking-questions.ts` | ✅ Neu erstellt |


### ✅ Neu in viator-client.ts hinzugefügt (2026-01-23)

| Endpoint | Funktion | Status |
|----------|----------|--------|
| `/bookings/{ref}/voucher` | `getBookingVoucher()` | ✅ Implementiert |
| `/products/booking-questions` | `getProductBookingQuestions()` | ✅ Implementiert |
| `/bookings/modified-since/acknowledge` | `acknowledgeModifiedBookings()` | ✅ Implementiert |
| `/locations/bulk` | `fetchLocationsBulk()` | ✅ Implementiert |
| `/attractions/search` | `searchAttractions()` | ✅ Implementiert |

### ❌ Noch fehlend 

| Endpoint | Zweck | Priorität |
|----------|-------|-----------|
| `/availability/schedules/modified-since` | Availability für DB cachen (nur Skript, keine Client-Funktion nötig) | 🟡 Mittel |


---

## PHASE 1: Supabase Database Setup
**Status**: ✅ Abgeschlossen (2026-01-23)

- [x] Supabase auf VPS eingerichtet
- [x] Prisma Schema definiert
- [x] Migrationen ausgeführt
- [x] Verbindung getestet

---

## PHASE 2: Ingestion Pipeline (Sync Jobs)
**Status**: 🟡 In Arbeit (75% abgeschlossen)

### ✅ Abgeschlossen

- [x] `/products/modified-since` - Sync-Skript erstellt (Fix: `Accept-Language: en`)
- [x] `/products/bulk` - Bulk-Fetch für Produktdetails
- [x] `/destinations` - 3,375 Destinations synchronisiert
- [x] `/products/tags` - 1,257 Tags synchronisiert  
- [x] `/exchange-rates` - 1,296 Wechselkurse synchronisiert

### ⏳ Ausstehend

- [ ] `/availability/schedules/modified-since` - Skript erstellen
- [ ] `/locations/bulk` - Skript erstellen
- [ ] `/reviews/product` - Skript erstellen
- [ ] `/products/booking-questions` - Skript erstellen
- [ ] Cron-Jobs einrichten

---

## PHASE 3: viator-client.ts API Integration
**Status**: ✅ Abgeschlossen

Alle kritischen API-Funktionen sind bereits in `lib/api/viator-client.ts` implementiert:

- [x] Produktsuche (`searchViatorProducts`)
- [x] Produktdetails (`getViatorProductDetails`)
- [x] Verfügbarkeit prüfen (`getViatorAvailability`)
- [x] Cart Hold (`createViatorCartHold`)
- [x] Buchung erstellen (`createViatorBooking`)
- [x] Buchungsstatus (`getBookingStatus`)
- [x] Stornierung (`cancelBooking`, `cancelBookingQuote`)
- [x] Reviews abrufen (`getProductReviews`)

---

## PHASE 4: Booking Flow Implementation
**Status**: 🟡 In Arbeit (50%)

### ✅ Backend fertig (in viator-client.ts)

- [x] `createViatorCartHold()` - Warenkorb erstellen
- [x] `createViatorBooking()` - Buchung abschließen  
- [x] `getBookingStatus()` - Status prüfen
- [x] `cancelBookingQuote()` - Stornierungskosten
- [x] `cancelBooking()` - Stornierung durchführen

### ⏳ Frontend/API Routes ausstehend

- [ ] `/api/bookings/hold` - API Route erstellen
- [ ] `/api/bookings/book` - API Route erstellen
- [ ] `/api/bookings/status` - API Route erstellen
- [ ] `/api/bookings/cancel` - API Route erstellen
- [ ] `/api/bookings/voucher` - **NEU: Funktion + Route erstellen**
- [ ] Checkout-Seite mit Buchungsformular
- [ ] Payment Integration (iframe)

---

## PHASE 5: Compliance & Finishing
**Status**: ⏳ Ausstehend

- [ ] `noindex` Meta-Tags für Review-Seiten
- [ ] 120 Sekunden API Timeout konfigurieren
- [ ] Error Handling verbessern
- [ ] Review Provider korrekt anzeigen

---

## PHASE 6: Testing & Viator Zertifizierung
**Status**: ⏳ Ausstehend

- [ ] Sandbox Test-Buchungen durchführen
- [ ] E2E Tests für Booking Flow
- [ ] Zertifizierung bei Viator einreichen

---

## 🎯 Nächste Schritte (Priorität)

1. **`/bookings/{ref}/voucher`** - Funktion in viator-client.ts hinzufügen
2. **`/products/booking-questions`** - Sync-Skript erstellen
3. **API Routes** für Booking Flow erstellen
4. **Checkout-Seite** implementieren

---

## 📁 Relevante Dateien

| Datei | Beschreibung |
|-------|--------------|
| `lib/api/viator-client.ts` | **Haupt-API-Client** (14+ Endpoints implementiert) |
| `scripts/sync/sync-products.ts` | Products Sync-Job |
| `scripts/sync/sync-destinations.ts` | Destinations Sync-Job |
| `scripts/sync/sync-tags.ts` | Tags Sync-Job |
| `scripts/sync/sync-exchange-rates.ts` | Wechselkurse Sync-Job |
| `scripts/test-availability.ts` | Availability Test-Skript |
| `scripts/find-active-product.ts` | Helper zum Finden aktiver Produkte |

---

*Erstellt: 2026-01-15*
*Letzte Aktualisierung: 2026-01-23*
