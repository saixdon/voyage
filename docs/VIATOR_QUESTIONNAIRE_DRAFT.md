# Viator Backend Checks Questionnaire - DRAFT ANSWERS

> **Status**: ⏳ DRAFT v2 - Updated based on Viator feedback (2026-01-19)
> **Send to**: affiliateapi@tripadvisor.com
> **Important**: Once approved, any changes to endpoint usage must be discussed with Viator in advance!
>
> **Chosen Data Model**: ✅ **Ingestion Model** (with `/products/modified-since` and `/availability/schedules/modified-since`)

---

## GENERAL QUESTIONS

### 1. What is your company name?
**Response**: 
```
TripVega
```

---

### 2. Is this a B2B or B2C implementation, or both?
**Suggested response**: 
```
B2C - Direct to consumer travel booking platform
```

---

### 3. Is this implementation for desktop, mobile, or app?
**Suggested response**: 
```
Desktop and Mobile (Responsive Web Application). No native app at this time.
```

---

### 4. How many destinations do you support? Which destinations do you exclude, if any, and why?
**Suggested response**: 
```
We support all destinations available through the Viator API. 
No destinations are currently excluded.
```

**Alternative (if using curated catalog)**:
```
We will use the curated product catalog provided by Viator.
All destinations included in the curated catalog will be supported.
```

---

### 5. How many products do you support? If you filter out some products, what criteria is it based on? Are you going to add more products post launch?
**Response**:
```
We plan to support all products available through the Viator API (full catalog).
No products are filtered out - we ingest all destinations and products available on Viator.
New products are automatically added via the hourly /products/modified-since delta updates.
```

---

## ENDPOINT USAGE TABLE

> **Note**: We are using the **Ingestion Model**. As per Viator guidelines:
> - `/products/modified-since` returns full product details, so `/products/bulk` is NOT needed for ingestion
> - `/bulk` endpoints are only used for edge cases (e.g., fetching a few specific products)
> - No real-time calls to `/products/{product-code}` since data comes from ingestion

| Endpoint | Ingestion | Real-time | Additional notes |
|----------|-----------|-----------|------------------|
| `/products/modified-since` | Hourly | - | Full product content ingestion, using cursor parameter |
| `/products/bulk` | - | - | Only for edge cases (max a few products at a time) |
| `/products/{product-code}` | - | - | Not used (data from ingestion) |
| `/availability/schedules/modified-since` | Hourly | - | Availability & pricing schedules, using cursor parameter |
| `/availability/schedules/bulk` | - | - | Only for edge cases |
| `/availability/schedules/{product-code}` | - | - | Not used (data from ingestion) |
| `/products/search` | - | - | Not used (search from own DB) |
| `/search/freetext` | - | - | Not used (search from own DB) |
| `/products/tags` | Weekly | - | Cached |
| `/products/booking-questions` | Monthly | - | Cached |
| `/locations/bulk` | Monthly | - | Cached + on-demand for new locations |
| `/exchange-rates` | Daily | - | Based on expiry timestamp |
| `/reviews/product` | Weekly | - | Cached, provider indicated |
| `/suppliers/search/product-codes` | Weekly | - | Cached |
| `/destinations` | Weekly | - | Cached |
| `/attractions/search` | Weekly | - | Cached |
| `/attractions/{attraction-id}` | Weekly | - | Cached |
| `/availability/check` | - | Yes | When user selects date/pax + before booking |
| `/bookings/cart/hold` | - | Yes | Before payment details |
| `/bookings/cart/book` | - | Yes | At checkout |
| `/v1/checkoutsessions/{sessionToken}/paymentaccounts` | - | Yes | For payment processing |
| `/bookings/status` | - | Yes | For pending bookings (hourly) |
| `/bookings/modified-since` | Every 3 min | - | For supplier cancellations |
| `/bookings/cancel-reasons` | Monthly | - | Cached |
| `/bookings/{booking-reference}/cancel-quote` | - | Yes | Before cancellation |
| `/bookings/{booking-reference}/cancel` | - | Yes | User-initiated cancellation |

> **Removed Endpoints**:
> - `/bookings/modified-since/acknowledge` - Not applicable (only for merchant partners to stop Viator cancellation emails)

---

## PRODUCT SEARCH

### 6. Do you provide search results to customers that are returned by our search endpoint or do you return search results directly from your database?
**Response**:
```
Search results are returned directly from our database (Supabase).
Product data is ingested via /products/modified-since at least hourly (as per Viator requirements).
We do NOT use /products/search or /products/{product-code} in real-time.
```

---

### 7. If you're using the search endpoint(s), can you confirm pagination is applied (max 50 products, additional requests only when customer wants more)?
**Response**:
```
N/A. We do not use the Viator search endpoints. 
Search is performed against our local database (Ingestion Model).
```

---

## ATTRACTIONS

### 8. Do you use attraction data from the API? If so, could you confirm that it's not indexed?
**Response**:
```
Yes, we use attraction data from the API.
Confirmed: Attraction pages include noindex meta tags to prevent search engine indexing.
```

---

## REVIEWS

### 9. Do you display Viator or Tripadvisor reviews from the API? If so, could you confirm that this data is not indexed?
**Response**:
```
Yes, we display reviews from the API.
Confirmed: Review content is not indexed (noindex meta tags applied).
Reviews are cached and refreshed weekly.
```

---

### 10. If the reviews or review scoring from the API are used on your site, do you indicate the provider of the reviews?
**Response**:
```
Yes, we indicate the provider of reviews.
We display: "Total review count and overall rating based on Viator and Tripadvisor reviews"
The correct provider (Viator/Tripadvisor) is specified for each review.
```

---

## EXCHANGE RATES

### 11. Do you use the Viator exchange rates from the /exchange-rates endpoint? If so, can you confirm that the exchange rates are cached and refreshed following the expiry timestamp?
**Response**:
```
Yes, we use Viator exchange rates from /exchange-rates.
Exchange rates are cached and refreshed based on the expiry timestamp from the response (currently once per day).
We use EUR as our primary booking currency.
```

---

## LOCATIONS

### 12. Do you have access to Google Places API to retrieve details of Google locations?
**Response**:
```
No, we do not currently have Google Places API access. 
We will only use Viator-provided location data from the /locations/bulk endpoint.
```

---

## REAL-TIME AVAILABILITY AND PRICING

### 13. Do you conduct availability and pricing checks in real-time prior to booking? If so, at what stage of the booking flow and what endpoint do you use?
**Response**:
```
Yes, we conduct real-time availability and pricing checks using /availability/check at two stages:

1. On the product display page when the customer selects a date and passenger mix (age bands)
   - This displays available product options and start times

2. Immediately before making the booking request
   - This double-checks availability and pricing before payment

This workflow follows Viator's best practice recommendation to minimize the possibility 
of customers finding items unavailable at checkout.
```

---

### 14. Can you confirm that the /availability/check endpoint is used when a specific date and passenger mix (age bands) are selected?
**Response**:
```
Confirmed. The /availability/check endpoint is called only after:
- User has selected a specific travel date
- User has selected passenger mix based on Viator age bands returned for the product
This endpoint is NOT used for ingesting availability/pricing data.
```

---

### 15. In case of pricing differences between previously quoted price and the new price from the /availability/check response, do you apply the new price?
**Response**:
```
Yes. If the /availability/check response returns a different price than previously quoted:
1. We apply the NEW price to the booking
2. We clearly communicate the price change to the customer before proceeding
3. The booking flow is NOT automatically canceled - the customer decides whether to proceed
```

---

## TIMEOUT

### 16. Have you implemented a timeout for API services on your end? If so, how long is it?
**Response**:
```
Yes, we have implemented a 120 second timeout for all Viator API services, as recommended.
```

---

## PCI COMPLIANCE

### 17. Can you confirm your PCI compliance status for handling payment data?
**Response**:
```
We use Viator's hosted checkout/payment solution. 
Payment card data is handled entirely by Viator's PCI-compliant infrastructure. 
We do NOT store, process, or transmit cardholder data on our systems.

Viator manages:
- Payment processing
- Customer support for payment-related inquiries
- Refunds and chargebacks
```

---

## CHECKLIST BEFORE SENDING

- [x] Company name filled in: TripVega
- [x] Chose model: Ingestion Model (with /products/modified-since and /availability/schedules/modified-since)
- [x] Confirmed ingestion frequency is at least hourly (via Supabase + cron-jobs)
- [x] Confirmed Google Places API access status: No (using Viator location data only)
- [x] Confirmed PCI Compliance status: Viator handles all payments
- [x] Full product catalog (all Viator destinations/products)
- [ ] Final review complete
- [ ] Send to affiliateapi@tripadvisor.com

---

**Send completed document to**: affiliateapi@tripadvisor.com
