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
| `it` | Italiano | 🇮🇹 | Active |
| `pt` | Português | 🇵🇹 | Active |
| `nl` | Nederlands | 🇳🇱 | Active |
| `ja` | 日本語 | 🇯🇵 | Active |
| `zh` | 简体中文 | 🇨🇳 | Active |

## File Structure

```
voyage/
├── messages/
│   ├── en.json          # English translations (primary)
│   ├── de.json          # German translations
│   ├── fr.json          # French translations
│   ├── es.json          # Spanish translations
│   ├── it.json          # Italian translations
│   ├── pt.json          # Portuguese translations
│   ├── nl.json          # Dutch translations
│   ├── ja.json          # Japanese translations
│   └── zh.json          # Chinese translations
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
export const locales = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'ja', 'zh'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
```

## Testing Translations

Before deploying:
1. Switch to each language in the UI
2. Check that all text is translated (no English fallbacks)
3. Verify RTL languages if added (not currently supported)
4. Test with long German text (often longest)
## Verification Protocol

**MANDATORY**: After implementing any language changes or adding new languages:

1.  **Full-Page Screenshot**: Take a screenshot of the entire page layout.
2.  **Word Verification**:
    *   **Analyze the screenshot** to visually confirm the presence of words in the target language.
    *   **Explicitly check** that key UI elements (headings, buttons, navigation) are displaying the correct localized text.
    *   **Verify** that dynamic content (e.g., product titles from Viator API) is also returned in the target language.
3.  **Fail Condition**: If the page remains predominantly in English (or the default language) where specialized translations should be, consider the integration incomplete.

## Comprehensive i18n & Translation Workflow

This workflow is specialized to fully internationalize website areas without overlooking nested components or external data files (like `constants.ts`, `data/faq.ts`).

### Phase 1: Discovery & Dependency Mapping (IMPORTANT)

Before changing code, you must understand the scope. Do not only look at the currently open file.

1.  **Entry Point Analysis:** Identify the main component (e.g., `Page.tsx` or `LandingPage.tsx`).
2.  **Recursive Tree Traversal:**
    *   Scan all imports within the component.
    *   Identify **local components** (e.g., `components/Hero.tsx`, `components/FAQ.tsx`).
    *   Identify **data files** (e.g., `data/pricing.ts`, `constants/navigation.ts`) containing text rendered in the UI.
    *   Ignore external libraries (e.g., `node_modules`), focus on `src/` or `app/` folders.
3.  **Create Audit List:** Create a list in the chat of all files belonging to the full page representation that contain text. Wait for user confirmation if the list seems incomplete.

### Phase 2: Extraction & Structuring

Process the audit list file by file. Adhere to the project's i18n framework (e.g., `next-intl`).

**Extraction Rules:**
*   **Hard-coded Strings:** Search for every user-visible string (JSX text, `placeholder`, `title`, `alt` tags, strings in arrays/objects).
*   **Key Generation:** Create semantic keys.
    *   *Bad:* `faq_title_1`
    *   *Good:* `LandingPage.FAQ.title` or `Components.Pricing.monthlyPlan`
*   **Namespace Discipline:** If an FAQ file (`faq.ts`) is separate, check if these strings belong in a separate translation file or global scope.
*   **Variables & Pluralization:** If strings contain dynamic values (e.g., "3 articles"), use ICU Message Syntax or framework interpolation (e.g., `{count, plural, ...}`).

### Phase 3: Implementation & Validation

Execute changes piece by piece:

1.  **Dictionary Update:** Add new keys to the primary language file (e.g., `messages/en.json`).
2.  **Component Refactoring:**
    *   Replace text with the hook (e.g., `useTranslations`).
    *   Ensure Server Components and Client Components are handled correctly (`getTranslations` vs `useTranslations`).
3.  **Layout Check (AI Vision):**
    *   Remember that text in other languages (e.g., German vs English) is often longer (Text Expansion).
    *   Check if layout might break due to translation (e.g., fixed widths on buttons).

### Phase 4: Operational Protocols

*   **STOP RULE:** If you encounter a file containing text that was not in the original audit list, add it and inform the user. Do not ignore it.
*   **No Partial Work:** Mark a task as done only when *all* identified files of the page (incl. imported data) have been processed.

### Example Activation Prompt
"Apply the comprehensive-i18n skill to my Landing Page. The main file is `src/app/page.tsx`."
