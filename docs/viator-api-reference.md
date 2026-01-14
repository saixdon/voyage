# Viator Partner API - Referenz

## Dokumentation
https://docs.viator.com/partner-api/technical/

## Authentifizierung
- API Key wird als Header-Parameter übergeben: `exp-api-key: YOUR_API_KEY`
- Sprache wird per `Accept-Language` Header gesteuert (z.B. `de`, `en`)

## Basis-URLs
- **Sandbox**: `https://api.sandbox.viator.com/partner`
- **Production**: `https://api.viator.com/partner`

## Zugangs-Level (Basic Access Affiliate)
Mit Basic Access haben wir Zugriff auf:
- `/products/modified-since` - Alle Produkte abrufen (mit Änderungsdatum)
- `/products/bulk` - Mehrere Produkte auf einmal abrufen
- `/products/{product-code}` - Einzelnes Produkt abrufen
- `/products/tags` - Produkt-Tags
- `/products/search` - Produktsuche
- `/products/recommendations` - Empfehlungen
- `/attractions/search` - Attraktionen suchen
- `/availability/check` - Verfügbarkeit prüfen
- `/availability/schedules/{product-code}` - Verfügbarkeits-Schedule
- `/search/freetext` - Freitext-Suche
- `/destinations` - Reiseziele
- `/locations/bulk` - Orte abrufen
- `/exchange-rates` - Wechselkurse
- `/reviews/product` - Produkt-Bewertungen

## KEIN Zugang zu (Basic Access):
- Booking-Endpoints (`/bookings/*`)
- Cart-Endpoints (`/bookings/cart/*`)
- Amendment-Endpoints (`/amendment/*`)

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

## Affiliate Deep Links
Da wir Basic Access haben, müssen Buchungen über Viator erfolgen.
Affiliate-Link Format: `https://www.viator.com/tours/{destination}/{product-title}/d{destination-id}-{product-code}`

## Rate Limiting
- HTTP 429 = Rate Limit erreicht
- Retry-After Header beachten
