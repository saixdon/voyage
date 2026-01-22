# Viator Partner API - Referenz

## Dokumentation
https://docs.viator.com/partner-api/technical/

## Authentifizierung
- API Key wird als Header-Parameter übergeben: `exp-api-key: YOUR_API_KEY`
- Sprache wird per `Accept-Language` Header gesteuert (z.B. `de`, `en`)

## Basis-URLs
- **Sandbox**: `https://api.sandbox.viator.com/partner`
- **Production**: `https://api.viator.com/partner`

## Zugangs-Level: Full + Booking Access ✅

> **Status Update (Januar 2026)**: Viator hat unseren Antrag auf Full + Booking Access genehmigt!
> - Sandbox-Schlüssel mit vollem Zugang erhalten
> - Nach Zertifizierung wird ein Produktions-Schlüssel bereitgestellt

### Verfügbare Endpoints (Full + Booking Access)

**Produkte & Suche:**
- `/products/modified-since` - Alle Produkte abrufen (mit Änderungsdatum)
- `/products/bulk` - Mehrere Produkte auf einmal abrufen
- `/products/{product-code}` - Einzelnes Produkt abrufen
- `/products/tags` - Produkt-Tags
- `/products/search` - Produktsuche
- `/products/recommendations` - Empfehlungen
- `/attractions/search` - Attraktionen suchen
- `/search/freetext` - Freitext-Suche

**Verfügbarkeit:**
- `/availability/check` - Verfügbarkeit prüfen
- `/availability/schedules/{product-code}` - Verfügbarkeits-Schedule
- `/availability/schedules/bulk` - Mehrere Schedules auf einmal

**Buchungen (NEU mit Full Access):**
- `/bookings/cart/hold` - Warenkorb erstellen und Preis sichern
- `/bookings/cart/book` - Buchung abschließen
- `/bookings/cart/cancel` - Buchung stornieren
- `/bookings/status` - Buchungsstatus abrufen
- `/bookings/{bookingRef}/voucher` - Voucher/Ticket abrufen ⭐

**Stornierung:**
- `/bookings/{bookingRef}/cancel` - Buchung stornieren
- `/bookings/{bookingRef}/cancel/reasons` - Stornierungsgründe
- `/bookings/{bookingRef}/cancel/quote` - Stornierungs-Quote

**Sonstiges:**
- `/destinations` - Reiseziele
- `/locations/bulk` - Orte abrufen
- `/exchange-rates` - Wechselkurse
- `/reviews/product` - Produkt-Bewertungen

## Wichtige Headers für alle Requests
```
Accept: application/json;version=2.0
Accept-Language: de
exp-api-key: YOUR_VIATOR_API_KEY
Content-Type: application/json (für POST requests)
```

## Beispiel: Produkt-Suche
```
POST /partner/products/search
{
  "searchTerm": "Leipzig",
  "pagination": {
    "start": 1,
    "count": 20
  },
  "sorting": {
    "sort": "TRAVELER_RATING",
    "order": "DESC"
  }
}
```

## Beispiel: Freitext-Suche
```
POST /partner/search/freetext
{
  "searchTerm": "Leipzig tours",
  "searchTypes": ["PRODUCTS", "DESTINATIONS"],
  "currency": "EUR"
}
```

## Beispiel: Buchung erstellen (Hold + Book Flow)
```
# 1. Hold - Warenkorb erstellen
POST /partner/bookings/cart/hold
{
  "items": [{
    "productCode": "12345P1",
    "productOptionCode": "TG1",
    "travelDate": "2026-03-15",
    "paxMix": [{ "ageBand": "ADULT", "numberOfTravelers": 2 }]
  }],
  "currency": "EUR"
}

# 2. Book - Buchung abschließen
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

## Product Response Struktur
```json
{
  "productCode": "12345P1",
  "title": "Tour Name",
  "description": "...",
  "images": [{ "variants": [{ "url": "..." }] }],
  "pricing": {
    "summary": { "fromPrice": 29.99 },
    "currency": "EUR"
  },
  "reviews": {
    "combinedAverageRating": 4.5,
    "totalReviews": 150
  },
  "duration": {
    "fixedDurationInMinutes": 180
  },
  "destinations": [{ "ref": "123", "name": "Leipzig" }]
}
```

## Voucher-Handling
Mit Full + Booking Access können wir Vouchers selbst abrufen und an Kunden senden:
```
GET /partner/bookings/{bookingRef}/voucher
```

**Vorteile:**
- Eigenes Branding auf E-Mails möglich
- Volle Kontrolle über Kundenkommunikation
- Tickets/Vouchers direkt in TripVega anzeigen

## Zertifizierungs-Prozess
1. ✅ Sandbox-Schlüssel mit Full + Booking Access erhalten
2. 🔄 Integration gemäß API-Dokumentation erstellen (in Arbeit)
3. ⏳ Zertifizierung bei affiliateapi@tripadvisor.com anfordern
4. ⏳ Produktionsschlüssel erhalten und live gehen

## Rate Limiting
- HTTP 429 = Rate Limit erreicht
- Retry-After Header beachten
