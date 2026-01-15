# Viator API Integration - Master Reference Document

> **PURPOSE**: This document serves as the central knowledge base for Viator API integration.
> When encountering issues, search this document using keywords related to the problem area.

---

## 🔑 KEYWORD INDEX (For Quick Problem Resolution)

| Problem Area | Keywords to Search |
|--------------|-------------------|
| API Errors / Rate Limits | `ENDPOINT_USAGE`, `RATE_LIMIT`, `SERVICE_DEACTIVATION` |
| Product Data Issues | `PRODUCTS_ENDPOINT`, `INGESTION_MODEL`, `MODIFIED_SINCE` |
| Availability Problems | `AVAILABILITY_ENDPOINT`, `SCHEDULES`, `PRICING` |
| Search Not Working | `SEARCH_ENDPOINT`, `PAGINATION`, `FREETEXT` |
| Caching Issues | `CACHE_DURATION`, `REFRESH_FREQUENCY`, `AUXILIARY_DATA` |
| Booking Flow | `BOOKING_QUESTIONS`, `CHECKOUT`, `PCI_COMPLIANCE` |
| Payment Issues | `PAYMENT_API`, `IFRAME`, `CERTIFICATION` |

---

## 📊 ACCESS LEVELS

### Current Status: Requested `Full + Booking Access`

| Level | Description | Our Status |
|-------|-------------|------------|
| Basic | Redirect to Viator.com | ✅ Currently Implemented |
| Full | Cache product data locally | 🔄 Required for upgrade |
| Full + Booking | Complete checkout on our site | 🎯 Requested |

### Requirements for Full + Booking Access:
1. ⏳ Booking Questions Flow implementation
2. ⏳ PCI Compliance proof
3. ⏳ Certification with Viator team
4. ⏳ Database for caching (Supabase planned)

---

## ✅ ACTION ITEMS (From Viator Email - 2026-01-15)

> **Contact**: Chris - Viator API Integrations
> **Status**: Awaiting our responses before sandbox access is granted

### 📋 REQUIRED RESPONSES TO VIATOR

#### 1. Payment Solution Selection
`PAYMENT_API` `IFRAME` `CHECKOUT`

**Question**: Which payment solution will you implement?

| Option | Description | PCI Requirement |
|--------|-------------|-----------------|
| **API Payments** | Full control, custom checkout | PCI DSS AOC (by certified assessor) |
| **iframe** | Viator-hosted payment form | SAQ A (self-assessment) |

**Documentation**: https://partnerresources.viator.com/travel-commerce/api-payments/

**Our Decision**: ⏳ TODO - Choose one
- [ ] API Payments (more work, full control)
- [ ] iframe (easier, less control)

**Recommendation**: Start with **iframe** (SAQ A self-assessment is much easier than full PCI DSS audit)

---

#### 2. PCI Compliance Certificate
`PCI_COMPLIANCE` `CERTIFICATION` `AOC`

**Requirement**: Provide valid PCI DSS compliance certificate

| Solution | Certificate Required | How to Get |
|----------|---------------------|------------|
| API Payments | PCI DSS AOC | Certified assessor (expensive, complex) |
| iframe | SAQ A AOC | Self-assessment questionnaire |

**⚠️ WARNING**: Certificate must be kept current. Expiration = Service deactivation!

**Our Status**: ⏳ TODO - Obtain certificate after payment solution decision

---

#### 3. Endpoint Usage Questionnaire
`ENDPOINT_USAGE` `BACKEND_CHECKS`

**Requirement**: Fill out attached file "Viator Affiliate API with booking access - back-end checks"

**Our Status**: ⏳ TODO - Waiting for PDF attachment from user

**Action**: Document our planned endpoint usage:
- [ ] Which endpoints will we use?
- [ ] How will we cache data?
- [ ] What is our sync frequency?

---

#### 4. Certification Requirements Confirmation
`CERTIFICATION` `FRONTEND` `BACKEND`

**Requirement**: Confirm compliance with all certification requirements

**Documentation**: https://partnerresources.viator.com/travel-commerce/certification/

**What gets checked**:
- Frontend implementation
- Backend implementation
- Data integrity
- API usage correctness

**Our Status**: ⏳ TODO - Review requirements and confirm

---

#### 5. Product Catalog Decision
`PRODUCT_CATALOG` `CURATED` `FULL_CATALOG`

**Question**: Do you want the curated subset or full catalog?

| Option | Pros | Cons |
|--------|------|------|
| **Curated Subset** | Higher conversion, simpler integration, maintained by Viator | Limited selection |
| **Full Catalog** | Access to all products | Complex filtering needed, more maintenance |

**Our Decision**: ⏳ TODO - Choose one
- [ ] Curated subset (recommended for faster start)
- [ ] Full catalog (more products, more work)

---

### 📊 SUMMARY: REQUIRED ACTIONS

| # | Action | Status | Owner |
|---|--------|--------|-------|
| 1 | Choose Payment Solution (API vs iframe) | ⏳ TODO | User Decision |
| 2 | Obtain PCI Compliance Certificate | ⏳ TODO | User |
| 3 | Fill Endpoint Usage Questionnaire | ⏳ Waiting for PDF | User + Dev |
| 4 | Confirm Certification Requirements | ⏳ TODO | Dev (review docs) |
| 5 | Choose Product Catalog (curated vs full) | ⏳ TODO | User Decision |
| 6 | Send responses to Chris @ Viator | ⏳ Blocked | After above complete |

### 📍 NEXT STEPS (Viator's Process)

```
Current Stage
     ↓
[1] Answer Questions → Send to Viator
     ↓
[2] Receive Sandbox Booking Access
     ↓
[3] Implement Integration
     ↓
[4] Frontend + Backend Certification Checks
     ↓
[5] Receive Production Access
     ↓
[6] Go Live! 🚀
```

---

## 🗄️ DATABASE DECISION

**Decision**: Use **Supabase** (self-hosted on VPS) for:
- Product data caching (required for Full Access)
- Availability schedule storage
- Auxiliary data caching

---

## 📡 DATA MANAGEMENT MODELS

> ⚠️ **CRITICAL**: You must choose ONE model. They CANNOT be used simultaneously!

### MODEL 1: Ingestion Model (Recommended for Full Access)
`INGESTION_MODEL` `MODIFIED_SINCE` `HOURLY_SYNC`

**Endpoints Used:**
- `/products/modified-since` - **Hourly** (Rec: 15-20 mins). Use `cursor` parameter.
- `/availability/schedules/modified-since` - **Hourly** (Rec: 15-20 mins). Use `cursor` parameter.

**Flow:**
```
Viator API --> Supabase DB --> Your Website
     ^                              |
     |________ 20min Sync __________|
```

**Rules:**
- ❌ Do NOT call `/products/{product-code}` in real-time. Use cached DB only.
- ❌ Do NOT call `/availability/schedules/{product-code}` in real-time. Use cached DB only.
- ✅ Sync frequency: No longer than hourly (Recommended: 15-20 mins).

### MODEL 2: Real-Time Search Model (Current Implementation)
`REALTIME_MODEL` `SEARCH_ENDPOINT` `SINGLE_PRODUCT`

**Endpoints Used:**
- `/products/search` - Display search results (max 50 per call).
- `/products/{product-code}` - Get single product details.
- `/availability/schedules/{product-code}` - Get single product availability.

**Rules:**
- ✅ Cache results for maximum **1 hour**.
- ❌ Do NOT use for ingestion.
- ✅ Pagination: Use `start` and `count` only when user moves to next page.

---

## 🚫 ENDPOINT USAGE RULES & FREQUENCIES

`ENDPOINT_USAGE` `RATE_LIMIT` `COMPLIANCE`

### ✅ ALLOWED & REQUIRED USAGE

| Endpoint | Ingestion Model | Real-Time Model | Frequency / Cache Rule |
|----------|-----------------|-----------------|------------------------|
| `/products/modified-since` | ✅ YES | ❌ NO | Every 15-20 mins |
| `/availability/schedules/modified-since` | ✅ YES | ❌ NO | Every 15-20 mins |
| `/products/{product-code}` | ❌ NO | ✅ YES | Cache max 1 hour |
| `/availability/schedules/{product-code}` | ❌ NO | ✅ YES | Cache max 1 hour |
| `/products/search` | ❌ NO | ✅ YES | Cache max 1 hour. Count: 50. |
| `/availability/check` | ✅ YES | ✅ YES | Real-time in booking flow ONLY. |
| `/bookings/modified-since` | ✅ YES | ✅ YES | Every 2-5 mins (Supplier cancellations) |
| `/bookings/hold` | ✅ YES | ✅ YES | Before booking (optional but rec.) |
| `/exchange-rates` | ✅ YES | ✅ YES | Once a day (expiry timestamp) |
| `/locations/bulk` | ✅ YES | ✅ YES | Monthly |

### ❌ STRICTLY FORBIDDEN

| Endpoint | Forbidden Action |
|----------|------------------|
| `/products/search` | Using for ingestion (pulling all products) |
| `/products/search` | Requesting all pages automatically |
| `/products/{product-code}` | Calling if you are already using Ingestion Model |
| `/products/bulk` | Using for regular workflow (Edge cases only) |
| `/availability/schedules/bulk` | Using for regular workflow (Edge cases only) |

### 🛒 BOOKING FLOW RULES

1. **Availability Check** (`/availability/check`)
   - Call when user selects date/pax.
   - ⚠️ Call AGAIN right before `/bookings/book`.
   - If price changes, communicate to user (don't cancel).

2. **Booking Hold** (`/bookings/hold`)
   - Recommended before payment details.
   - Use with `/bookings/book`.
   - Verify timestamps.

3. **Cancellations** (`/bookings/modified-since`)
   - Must automate supplier cancellations.
   - Check every 2-5 mins.
   - Must acknowledge receipt via `/bookings/modified-since/acknowledge`.

---

---

## 🔍 SEARCH ENDPOINTS

`SEARCH_ENDPOINT` `PAGINATION` `FREETEXT`

### `/products/search`
- **Purpose**: Display search results when user searches
- **Returns**: Limited product information
- **Pagination**: REQUIRED when user wants more results
- ❌ Do NOT request all products from destination at once

### `/search/freetext`
- **Purpose**: Free text search queries
- **Same rules as `/products/search`**

### Getting Full Product Details After Search:
**Option A (Ingestion Model):** Read from your cached database
**Option B (Real-Time Model):** Call `/products/{product-code}` for the selected product only

---

## ⏰ CACHE & REFRESH FREQUENCY

`CACHE_DURATION` `REFRESH_FREQUENCY` `AUXILIARY_DATA`

### Product & Availability Data:
| Data Type | Refresh Frequency |
|-----------|-------------------|
| Product Content (Ingestion) | At least hourly |
| Availability Schedules (Ingestion) | At least hourly |
| Real-time product calls | Cache max 1 hour |
| Search results | Cache max 1 hour |

### Auxiliary Data:
- Must be cached
- Refresh according to Viator documentation
- See: https://docs.viator.com/partner-api/technical/#section/Workflows/Update-frequency

---

## 📚 OFFICIAL DOCUMENTATION LINKS

### Implementation Guides:
- Main Implementation Guide: https://partnerresources.viator.com/travel-commerce/implementation/
- API Payments Overview: https://partnerresources.viator.com/travel-commerce/api-payments/
- Managing Product & Availability: https://partnerresources.viator.com/travel-commerce/managing-product-availability-data/
- Technical Guide: https://partnerresources.viator.com/travel-commerce/technical-guide/
- Booking Questions: https://partnerresources.viator.com/travel-commerce/merchant/implementing-booking-questions/
- Certification Process: https://partnerresources.viator.com/travel-commerce/certification/

### API Endpoint Documentation:
| Endpoint | Documentation |
|----------|---------------|
| Products Modified Since | https://docs.viator.com/partner-api/technical/#tag/Products/operation/productsModifiedSince |
| Availability Schedules Modified | https://docs.viator.com/partner-api/technical/#tag/Availability/operation/availabilitySchedulesModifiedSince |
| Single Product | https://docs.viator.com/partner-api/technical/#tag/Products/operation/products |
| Single Availability | https://docs.viator.com/partner-api/technical/#tag/Availability/operation/availabilitySchedules |
| Products Bulk | https://docs.viator.com/partner-api/technical/#tag/Products/operation/productsBulk |
| Availability Bulk | https://docs.viator.com/partner-api/technical/#tag/Availability/operation/availabilitySchedulesBulk |
| Products Search | https://docs.viator.com/partner-api/technical/#tag/Products/operation/productsSearch |
| Freetext Search | https://docs.viator.com/partner-api/technical/#tag/Auxiliary/operation/searchFreeText |
| Update Frequency | https://docs.viator.com/partner-api/technical/#section/Workflows/Update-frequency |
| Access Levels | https://docs.viator.com/partner-api/technical/#section/Access-to-endpoints |
e
### Access Level Guides:
- Basic Access Golden Path: https://partnerresources.viator.com/travel-commerce/affiliate/basic-access/golden-path/?source=specs

---

## 🏗️ IMPLEMENTATION ROADMAP

### Phase 1: Database Setup (Supabase)
- [ ] Set up Supabase locally
- [ ] Design schema for products, availability, auxiliary data
- [ ] Create sync jobs

### Phase 2: Ingestion Pipeline
- [ ] Implement `/products/modified-since` sync (hourly)
- [ ] Implement `/availability/schedules/modified-since` sync (hourly)
- [ ] Cache auxiliary data

### Phase 3: Booking Flow
- [ ] Implement Booking Questions
- [ ] Build checkout experience
- [ ] Integrate payment (API or iframe)

### Phase 4: Certification
- [ ] PCI Compliance documentation
- [ ] Submit for Viator certification
- [ ] Testing & go-live

---

## 🐛 TROUBLESHOOTING

### Error: Rate Limit / Service Deactivation
**Keywords**: `RATE_LIMIT`, `SERVICE_DEACTIVATION`
**Cause**: Incorrect endpoint usage (e.g., using search for ingestion)
**Solution**: Review `ENDPOINT_USAGE` section above

### Error: Stale Product Data
**Keywords**: `CACHE_DURATION`, `REFRESH_FREQUENCY`
**Cause**: Cache not refreshed frequently enough
**Solution**: Ensure hourly sync for ingestion model

### Error: Missing Product Details
**Keywords**: `SEARCH_ENDPOINT`, `SINGLE_PRODUCT`
**Cause**: Search only returns limited info
**Solution**: Call single product endpoint or use cached data

---

*Last Updated: 2026-01-15*
*Document Version: 1.0*
