# Viator Backend Checks Questionnaire - DRAFT ANSWERS

> **Status**: ⏳ DRAFT - Needs user review before sending
> **Send to**: affiliateapi@tripadvisor.com
> **Important**: Once approved, any changes to endpoint usage must be discussed with Viator in advance!

---

## GENERAL QUESTIONS

### 1. What is your company name?
**Your response**: 
Tripvega
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
**Suggested response (Option A - Full Catalog)**:
```
We plan to support all products available through the Viator API.
No products are filtered out.
We will continuously add new products as they become available via the ingestion endpoints.
```

**Suggested response (Option B - Curated Catalog)**:
```
We will use the curated subset of products provided by Viator.
This includes high-performing, reliable products as recommended by Viator.
We may expand to full catalog access in the future.
```

---

## ENDPOINT USAGE TABLE



| Endpoint | Ingestion | Real-time | Additional notes |
|----------|-----------|-----------|------------------|
| `/products/modified-since` | Every 20 min | - | Using cursor parameter |
| `/products/bulk` | As needed | - | To fetch full product details (content) after modified-since |
| `/products/{product-code}` | As needed | - | To fetch single product details (fallback) |
| `/availability/schedules/modified-since` | Every 20 min | - | Using cursor parameter |
| `/availability/schedules/bulk` | As needed | - | To fetch full schedules after modified-since |
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
| `/bookings/modified-since/acknowledge` | - | Yes | Within 5 min of cancellation |
| `/bookings/cancel-reasons` | Monthly | - | Cached |
| `/bookings/{booking-reference}/cancel-quote` | - | Yes | Before cancellation |
| `/bookings/{booking-reference}/cancel` | - | Yes | User-initiated cancellation |

---

## PRODUCT SEARCH

### 6. Do you provide search results to customers that are returned by our search endpoint or do you return search results directly from your database?
**Response**:
```
Search results are returned directly from our database (Supabase).
Product data is ingested via /products/modified-since every 20 minutes.
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
[TODO: Confirm if you have Google Places API access]

Option A: Yes, we have our own Google Places API account to retrieve location details.
Option B: No, we do not currently have Google Places API access. We will only use Viator-provided location data.
```

---

## REAL-TIME AVAILABILITY AND PRICING

### 13. Do you conduct availability and pricing checks in real-time prior to booking? If so, at what stage of the booking flow and what endpoint do you use?
**Response**:
```
Yes, we conduct real-time availability and pricing checks using /availability/check at two stages:
1. When the customer selects a date and passenger mix (age bands)
2. Immediately before submitting the booking request to verify current price/availability
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

## CHECKLIST BEFORE SENDING

- [ ] Company name filled in
- [x] Chose model: Ingestion
- [ ] Confirmed Google Places API access status
- [ ] Reviewed all responses
- [ ] Endpoint usage table completed

---

**Send completed document to**: affiliateapi@tripadvisor.com
