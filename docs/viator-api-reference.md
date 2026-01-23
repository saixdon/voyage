# Viator Partner API - Referenz

> **Letzte Aktualisierung**: 2026-01-23
> **Status**: Full + Booking Access ✅ Genehmigt

## Dokumentation
https://docs.viator.com/partner-api/technical/

## Authentifizierung
- API Key wird als Header-Parameter übergeben: `exp-api-key: YOUR_API_KEY`
- Sprache wird per `Accept-Language` Header gesteuert (z.B. `de`, `en`)
- **WICHTIG**: `Accept-Language` Header ist für viele Endpoints erforderlich!

## Basis-URLs
- **Sandbox**: `https://api.sandbox.viator.com/partner`
- **Production**: `https://api.viator.com/partner`

## Wichtige Headers für alle Requests
```
Accept: application/json;version=2.0
Accept-Language: en  ← WICHTIG! Ohne diesen Header: 400/403 Fehler
Content-Type: application/json (für POST requests)
exp-api-key: YOUR_VIATOR_API_KEY
```

---

## 📊 Endpoint Implementation Status

### ✅ Implementiert in `lib/api/viator-client.ts`

| Endpoint | Funktion | Methode |
|----------|----------|---------|
| `/products/search` | `searchViatorProducts()` | POST |
| `/products/{product-code}` | `getViatorProductDetails()` | GET |
| `/products/tags` | `fetchViatorTags()` | GET |
| `/products/booking-questions` | `getProductBookingQuestions()` | GET |
| `/destinations` | `fetchAllDestinations()` | GET |
| `/availability/check` | `getViatorAvailability()` | POST |
| `/availability/schedules/bulk` | `getViatorAvailabilitySchedulesBulk()` | POST |
| `/bookings/cart/hold` | `createViatorCartHold()` | POST |
| `/bookings/cart/book` | `createViatorBooking()` | POST |
| `/bookings/status` | `getBookingStatus()` | POST |
| `/bookings/{ref}/voucher` | `getBookingVoucher()` | GET |
| `/bookings/{ref}/cancel-quote` | `cancelBookingQuote()` | POST |
| `/bookings/{ref}/cancel` | `cancelBooking()` | POST |
| `/bookings/cancel-reasons` | `getViatorCancellationReasons()` | GET |
| `/bookings/modified-since` | `getBookingsModifiedSince()` | GET |
| `/bookings/modified-since/acknowledge` | `acknowledgeModifiedBookings()` | POST |
| `/reviews/product` | `getProductReviews()` | GET |

### ✅ Implementiert als Sync-Skripte

| Endpoint | Skript | Methode |
|----------|--------|---------|
| `/products/modified-since` | `sync-products.ts` | GET |
| `/products/bulk` | `sync-products.ts` | POST |
| `/destinations` | `sync-destinations.ts` | GET |
| `/products/tags` | `sync-tags.ts` | GET |
| `/exchange-rates` | `sync-exchange-rates.ts` | POST |

### ❌ Noch nicht implementiert

| Endpoint | Zweck | Priorität |
|----------|-------|-----------|
| `/availability/schedules/modified-since` | Availability Sync | 🟡 Mittel |
| `/locations/bulk` | Locations | 🟢 Niedrig |
| `/attractions/search` | Attraktionen | 🟢 Niedrig |

---

## Beispiel: Produkt-Suche
```json
POST /partner/products/search
Headers:
  Accept: application/json;version=2.0
  Accept-Language: en
  exp-api-key: YOUR_API_KEY

{
  "filtering": {
    "destination": "77"
  },
  "pagination": {
    "start": 1,
    "count": 20
  },
  "sorting": {
    "sort": "TRAVELER_RATING",
    "order": "DESC"
  },
  "currency": "EUR"
}
```

## Beispiel: Verfügbarkeit prüfen
```json
POST /partner/availability/check
Headers:
  Accept: application/json;version=2.0
  Accept-Language: en
  exp-api-key: YOUR_API_KEY

{
  "productCode": "5602P47",
  "travelDate": "2026-02-15",
  "paxMix": [
    { "ageBand": "ADULT", "numberOfTravelers": 2 }
  ],
  "currency": "EUR"
}
```

## Beispiel: Buchung erstellen (Hold + Book Flow)
```json
// 1. Hold - Warenkorb erstellen
POST /partner/bookings/cart/hold
{
  "items": [{
    "productCode": "5602P47",
    "productOptionCode": "TG1",
    "travelDate": "2026-03-15",
    "startTime": "07:00",
    "paxMix": [{ "ageBand": "ADULT", "numberOfTravelers": 2 }]
  }],
  "currency": "EUR"
}

// Response enthält: cartRef

// 2. Book - Buchung abschließen
POST /partner/bookings/cart/book
{
  "cartRef": "CART_REF_FROM_HOLD",
  "booker": {
    "email": "kunde@email.de",
    "firstName": "Max",
    "lastName": "Mustermann"
  },
  "paymentToken": "PAYMENT_TOKEN"
}
```

## Beispiel: Voucher abrufen
```
GET /partner/bookings/{bookingRef}/voucher
Headers:
  Accept: application/json;version=2.0
  Accept-Language: en
  exp-api-key: YOUR_API_KEY
```

---

## Rate Limiting
- HTTP 429 = Rate Limit erreicht
- Retry-After Header beachten
- Empfohlen: Max 10 Requests/Sekunde

## Timeout
- Empfohlen: 120 Sekunden für alle API-Calls
- Bei Timeout: `/bookings/status` prüfen vor Re-Booking

---

## Zertifizierungs-Prozess
1. ✅ Sandbox-Schlüssel mit Full + Booking Access erhalten
2. � Integration gemäß API-Dokumentation (In Arbeit)
3. ⏳ Zertifizierung bei affiliateapi@tripadvisor.com anfordern
4. ⏳ Produktionsschlüssel erhalten und live gehen
