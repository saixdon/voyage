---
name: viator-api
description: Handles Viator Partner API integration for TripVega. Use when fetching activities, destinations, availability, or booking data. Provides endpoint patterns, response types, error handling, and caching strategies.
---

# Viator API Integration Skill

TripVega integrates with the **Viator Partner API** to fetch travel activities, tours, and experiences. This skill provides patterns for consistent API usage.

## API Configuration

### Environment Variables

```env
VIATOR_API_KEY=your-api-key-here
VIATOR_API_BASE_URL=https://api.viator.com/partner
```

### Base Client (lib/api/viator-client.ts)

```typescript
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const VIATOR_BASE_URL = process.env.VIATOR_API_BASE_URL || 'https://api.viator.com/partner';

export async function viatorFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${VIATOR_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'exp-api-key': VIATOR_API_KEY!,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ViatorAPIError(response.status, await response.text());
  }

  return response.json();
}
```

## Core Endpoints

### 1. Search Products

**Endpoint:** `POST /products/search`

```typescript
interface ProductSearchRequest {
  filtering?: {
    destination?: string;         // Destination ref (e.g., "684")
    tags?: number[];              // Tag IDs for categories
    lowestPrice?: number;
    highestPrice?: number;
    rating?: {
      minimum?: number;           // 1-5
    };
  };
  sorting?: {
    sort: 'TRAVELER_RATING' | 'PRICE' | 'REVIEW_COUNT' | 'RELEVANCE';
    order: 'ASCENDING' | 'DESCENDING';
  };
  pagination?: {
    offset: number;
    limit: number;                // Max 50
  };
  currency?: string;              // ISO 4217 (EUR, USD, etc.)
}

// Usage
const products = await viatorFetch<ProductSearchResponse>('/products/search', {
  method: 'POST',
  body: JSON.stringify({
    filtering: {
      destination: '684',         // Berlin
    },
    sorting: {
      sort: 'TRAVELER_RATING',
      order: 'DESCENDING',
    },
    pagination: {
      offset: 0,
      limit: 20,
    },
    currency: 'EUR',
  }),
});
```

### 2. Get Product Details

**Endpoint:** `GET /products/{productCode}`

```typescript
const product = await viatorFetch<Product>(`/products/${productCode}`);
```

### 3. Get Destinations

**Endpoint:** `GET /destinations`

```typescript
interface Destination {
  ref: string;                    // e.g., "684"
  name: string;                   // e.g., "Berlin"
  type: 'CITY' | 'REGION' | 'COUNTRY';
  parentRef?: string;
  lookupId: string;
}

const destinations = await viatorFetch<{ destinations: Destination[] }>('/destinations');
```

### 4. Get Availability

**Endpoint:** `POST /availability/check`

```typescript
interface AvailabilityRequest {
  productCode: string;
  travelDate: string;             // YYYY-MM-DD
  currency?: string;
}

const availability = await viatorFetch<AvailabilityResponse>('/availability/check', {
  method: 'POST',
  body: JSON.stringify({
    productCode: 'PRODUCT123',
    travelDate: '2024-03-15',
    currency: 'EUR',
  }),
});
```

### 5. Get Categories (Tags)

**Endpoint:** `GET /tags`

```typescript
interface Tag {
  tagId: number;
  name: string;
  parentTagId?: number;
}

const tags = await viatorFetch<{ tags: Tag[] }>('/tags');
```

## Response Types

### Product Response

```typescript
interface Product {
  productCode: string;
  title: string;
  description: string;
  shortDescription?: string;
  images: ProductImage[];
  reviews: {
    totalReviews: number;
    averageRating: number;
    combinedAverageRating: number;
  };
  pricing: {
    summary: {
      fromPrice: number;
      fromPriceBeforeDiscount?: number;
    };
    currency: string;
  };
  duration?: {
    fixedDurationInMinutes?: number;
    variableDurationFromMinutes?: number;
    variableDurationToMinutes?: number;
  };
  inclusions?: string[];
  exclusions?: string[];
  highlights?: string[];
  itinerary?: ItineraryItem[];
  logistics?: {
    start?: Location[];
    end?: Location[];
  };
  cancellationPolicy?: CancellationPolicy;
  bookableItems?: BookableItem[];
}

interface ProductImage {
  imageSource: string;
  caption?: string;
  isCover: boolean;
  variants: ImageVariant[];
}
```

## Caching Strategy

### Server-Side Caching

Use Next.js fetch caching with appropriate revalidation:

```typescript
// Short-lived cache for dynamic data (availability)
const availability = await fetch(url, {
  next: { revalidate: 60 },  // 1 minute
});

// Medium cache for product details
const product = await fetch(url, {
  next: { revalidate: 3600 },  // 1 hour
});

// Long cache for static data (destinations, tags)
const destinations = await fetch(url, {
  next: { revalidate: 86400 },  // 24 hours
});
```

### Client-Side Caching

For SWR/React Query:

```typescript
const { data: products } = useSWR(
  ['products', destination],
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,  // 1 minute
  }
);
```

## Error Handling

### Error Types

```typescript
class ViatorAPIError extends Error {
  constructor(
    public status: number,
    public body: string,
    message?: string
  ) {
    super(message || `Viator API Error: ${status}`);
    this.name = 'ViatorAPIError';
  }
}

// Common error codes
const errorMessages: Record<number, string> = {
  400: 'Invalid request parameters',
  401: 'Invalid API key',
  403: 'Access forbidden',
  404: 'Product not found',
  429: 'Rate limit exceeded',
  500: 'Viator server error',
};
```

### Graceful Degradation

```typescript
async function getProducts(destination: string) {
  try {
    return await viatorFetch('/products/search', { ... });
  } catch (error) {
    if (error instanceof ViatorAPIError) {
      console.error(`Viator API failed: ${error.status}`);
      
      // Return cached/fallback data
      return getCachedProducts(destination);
    }
    throw error;
  }
}
```

## API Route Patterns

### Standard API Route Structure

```typescript
// app/api/viator/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { viatorFetch } from '@/lib/api/viator-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await viatorFetch('/products/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Products search error:', error);
    
    if (error instanceof ViatorAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Image Handling

Viator provides multiple image variants. Use the appropriate size:

```typescript
function getImageUrl(image: ProductImage, size: 'small' | 'medium' | 'large' = 'medium') {
  const sizeMap = {
    small: 360,
    medium: 720,
    large: 1080,
  };
  
  const variant = image.variants.find(v => v.width >= sizeMap[size]);
  return variant?.url || image.imageSource;
}
```

## Rate Limiting

- **Production limit:** 100 requests/second
- **Sandbox limit:** 10 requests/second

Implement request queuing for bulk operations:

```typescript
import pLimit from 'p-limit';

const limit = pLimit(10);  // Max 10 concurrent requests

const products = await Promise.all(
  productCodes.map(code => 
    limit(() => viatorFetch(`/products/${code}`))
  )
);
```

## Testing

### Mock Data for Development

```typescript
// lib/api/viator-mock.ts
export const mockProduct: Product = {
  productCode: 'TEST123',
  title: 'Mock Berlin City Tour',
  description: 'A wonderful tour of Berlin...',
  reviews: {
    totalReviews: 1234,
    averageRating: 4.8,
    combinedAverageRating: 4.8,
  },
  pricing: {
    summary: { fromPrice: 29.00 },
    currency: 'EUR',
  },
  // ... etc
};
```

### Environment Switching

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction
  ? 'https://api.viator.com/partner'
  : 'https://api.sandbox.viator.com/partner';
```

## Best Practices

### DO:
- ✅ Always include Accept-Language header
- ✅ Cache aggressively for static data (destinations, tags)
- ✅ Log API errors with request details
- ✅ Use TypeScript interfaces for all responses
- ✅ Handle rate limiting gracefully

### DON'T:
- ❌ Expose API key to client-side code
- ❌ Make unnecessary duplicate requests
- ❌ Ignore pagination (always handle it)
- ❌ Store Viator productCodes as primary keys (use your own IDs)
- ❌ Assume availability is static (always check fresh)

## Common Issues

### 1. Empty Results
Check that destination refs match Viator's format (string IDs like "684").

### 2. Missing Images
Always provide a fallback image URL for products without images.

### 3. Price Discrepancies
Always use the API-returned currency; don't assume EUR.

### 4. Slow Responses
Product search with many filters can be slow. Cache results and show loading states.
