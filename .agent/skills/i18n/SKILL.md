---
name: i18n
description: Handles multi-language support for TripVega. Use when implementing translations, language switcher, adding new translatable text, or extending locale support. This skill provides patterns for next-intl integration, translation file management, and locale-aware routing.
---

# Internationalization (i18n) Skill

TripVega supports multiple languages using **next-intl**. This skill ensures consistent translation implementation across all components.

## Supported Languages

| Code | Language | Flag | Status |
|------|----------|------|--------|
| `en` | English | 🇬🇧 | Primary (default) |
| `de` | Deutsch | 🇩🇪 | Active |
| `fr` | Français | 🇫🇷 | Active |
| `es` | Español | 🇪🇸 | Active |

## File Structure

```
voyage/
├── messages/
│   ├── en.json          # English translations (primary)
│   ├── de.json          # German translations
│   ├── fr.json          # French translations
│   └── es.json          # Spanish translations
├── lib/
│   └── i18n/
│       ├── config.ts    # i18n configuration
│       ├── request.ts   # Server-side locale handling
│       └── navigation.ts # Localized navigation helpers
├── middleware.ts        # Locale detection & routing
└── app/
    └── [locale]/        # Locale-prefixed routes
```

## Translation File Structure

All translation files follow this namespace structure:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel",
    "search": "Search",
    "close": "Close"
  },
  "nav": {
    "destinations": "Destinations",
    "activities": "Activities",
    "culture": "Culture",
    "login": "Login",
    "logout": "Sign Out",
    "explore": "Explore"
  },
  "home": {
    "hero": {
      "title": "Discover the World",
      "subtitle": "Find and book unforgettable experiences worldwide",
      "searchPlaceholder": "Where do you want to go?"
    },
    "sections": {
      "topRated": "Top Rated Experiences",
      "trending": "Trending Destinations",
      "categories": "Browse by Category"
    }
  },
  "activity": {
    "bookNow": "Book Now",
    "from": "From",
    "perPerson": "per person",
    "duration": "Duration",
    "rating": "Rating",
    "reviews": "reviews",
    "included": "What's Included",
    "highlights": "Highlights"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Create Account",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?"
  },
  "footer": {
    "rights": "All rights reserved",
    "privacy": "Privacy Policy",
    "terms": "Terms & Conditions",
    "imprint": "Imprint",
    "contact": "Contact"
  },
  "currency": {
    "eur": "Euro",
    "usd": "US Dollar",
    "gbp": "British Pound",
    "chf": "Swiss Franc"
  }
}
```

## Implementation Patterns

### 1. Using Translations in Components

**Client Components:**
```tsx
"use client";
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('home');
  
  return (
    <h1>{t('hero.title')}</h1>
  );
}
```

**Server Components:**
```tsx
import { getTranslations } from 'next-intl/server';

export async function MyServerComponent() {
  const t = await getTranslations('home');
  
  return (
    <h1>{t('hero.title')}</h1>
  );
}
```

### 2. Dynamic Values & Interpolation

```json
{
  "activity": {
    "reviewCount": "{count, plural, =0 {No reviews} =1 {1 review} other {# reviews}}",
    "priceFrom": "From {price}"
  }
}
```

```tsx
const t = useTranslations('activity');
t('reviewCount', { count: 42 }); // "42 reviews"
t('priceFrom', { price: '€29.00' }); // "From €29.00"
```

### 3. Language Switcher Integration

The language switcher in the Navbar must:
1. Save selection to localStorage under key `tripvega-locale`
2. Update the URL locale prefix
3. Trigger a page refresh to load new translations

```tsx
import { useRouter, usePathname } from '@/lib/i18n/navigation';

function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  
  const changeLocale = (locale: string) => {
    localStorage.setItem('tripvega-locale', locale);
    router.replace(pathname, { locale });
  };
}
```

### 4. Adding New Translatable Text

When adding new UI text:

1. **Never hardcode strings** - always use translation keys
2. **Add to English first** (`messages/en.json`) - this is the source of truth
3. **Add to all languages** - copy to de.json, fr.json, es.json
4. **Use semantic namespaces** - group by feature (home, activity, auth, etc.)

**Example workflow:**
```bash
# 1. Add key to English
messages/en.json: "newFeature": { "title": "New Feature" }

# 2. Translate and add to other languages
messages/de.json: "newFeature": { "title": "Neue Funktion" }
messages/fr.json: "newFeature": { "title": "Nouvelle Fonctionnalité" }
messages/es.json: "newFeature": { "title": "Nueva Función" }
```

## Locale Detection Priority

1. URL path prefix (`/de/destinations`)
2. localStorage (`tripvega-locale`)
3. Browser `Accept-Language` header
4. Default to `en`

## Best Practices

### DO:
- ✅ Use namespaced keys: `t('home.hero.title')`
- ✅ Keep translations SHORT for UI elements
- ✅ Use ICU message format for plurals/variables
- ✅ Test all languages after adding new keys
- ✅ Keep translation files alphabetically sorted

### DON'T:
- ❌ Concatenate translated strings: `t('hello') + ' ' + t('world')`
- ❌ Put HTML in translations (use rich text format instead)
- ❌ Use translation keys in computed strings
- ❌ Forget to add keys to ALL language files

## Required Dependencies

```json
{
  "next-intl": "^3.x"
}
```

## Configuration Files

### next.config.ts
```ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

export default withNextIntl({
  // existing config
});
```

### lib/i18n/config.ts
```ts
export const locales = ['en', 'de', 'fr', 'es'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
```

## Testing Translations

Before deploying:
1. Switch to each language in the UI
2. Check that all text is translated (no English fallbacks)
3. Verify RTL languages if added (not currently supported)
4. Test with long German text (often longest)
