# Product Requirements Document (PRD)
## GetYourGuide-ähnliche Buchungsplattform

**Version:** 1.0  
**Datum:** Januar 2026  
**Autor:** Produktteam  
**Status:** Entwurf

---

## 1. Executive Summary

### 1.1 Produktvision
Entwicklung einer modernen, benutzerfreundlichen Buchungsplattform für Touren, Aktivitäten und Erlebnisse weltweit. Die Plattform integriert die GetYourGuide Partner API und bietet Benutzern die Möglichkeit, Aktivitäten zu suchen, zu buchen, zu verwalten und zu speichern.

### 1.2 Hauptziele
- Nahtlose Integration mit GetYourGuide Partner API
- Intuitive Benutzeroberfläche mit modernem Design
- Robuste Authentifizierung und Benutzerverwaltung
- Leistungsstarke Such- und Filterfunktionen
- Sichere Buchungsverwaltung

### 1.3 Zielgruppe
- Reisende (18-65 Jahre)
- Touristen auf der Suche nach lokalen Erlebnissen
- Geschäftsreisende
- Abenteuerlustige und Kulturinteressierte

---

## 2. Funktionale Anforderungen

### 2.1 Benutzerauthentifizierung & -verwaltung

#### 2.1.1 Registrierung
**Must-Have:**
- E-Mail-basierte Registrierung
- Passwort-Anforderungen (min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl, Sonderzeichen)
- E-Mail-Verifizierung
- OAuth 2.0 Integration (Google, Apple, Facebook)
- DSGVO-konforme Datenschutzerklärung

**Datenfelder:**
```
- Email (unique, required)
- Passwort (hashed, required)
- Vorname (required)
- Nachname (required)
- Telefonnummer (optional)
- Geburtsdatum (optional)
- Profilbild (optional)
- Bevorzugte Sprache (default: DE)
- Bevorzugte Währung (default: EUR)
```

#### 2.1.2 Login
- E-Mail/Passwort-Login
- OAuth Social Login
- "Angemeldet bleiben" Option
- Passwort zurücksetzen (E-Mail-Link)
- 2FA (optional, Phase 2)

#### 2.1.3 Benutzerprofil
- Profil bearbeiten
- Profilbild hochladen/ändern
- Passwort ändern
- Präferenzen verwalten
- Account löschen

### 2.2 Suche & Entdeckung

#### 2.2.1 Hauptsuchfunktion
**Autocomplete/Typeahead:**
```javascript
// Suchvorschläge erscheinen ab 2 Zeichen
Eingabe: "Pa"
Vorschläge:
  - Städte: "Paris, Frankreich" (mit Icon)
  - Aktivitäten: "Parasailing" (mit Icon)
  - Kategorien: "Parks & Gärten" (mit Icon)
  - Beliebte Touren: "Paris: Eiffelturm Tour" (mit Icon + Bewertung)
```

**API-Anforderungen:**
- Debouncing (300ms)
- Max. 10 Vorschläge
- Kategorisierte Ergebnisse (Orte, Aktivitäten, Touren)
- Bilder/Icons für visuelle Orientierung

#### 2.2.2 Erweiterte Suche
**Filter:**
- Datum/Zeitraum
- Preisspanne (Slider)
- Dauer (Stunden)
- Kategorien (Mehrfachauswahl)
- Bewertung (min. Sterne)
- Sprache der Tour
- Verfügbarkeit
- Sofortige Bestätigung
- Kostenlose Stornierung

**Sortierung:**
- Empfohlen (default)
- Preis (niedrig → hoch)
- Preis (hoch → niedrig)
- Bewertung
- Beliebtheit
- Neueste

#### 2.2.3 Kategorien-Navigation
Hauptkategorien (analog zu Ihrer Landing Page):
- Food & Drink
- Sports
- Culture (Museen, Galerien)
- Nature (Wandern, Parks)
- Adventures (Abenteuer)
- Water Activities (Wassersport)

### 2.3 Produktdetailseite

#### 2.3.1 Informationsarchitektur
```
1. Hero Section
   - Bildergalerie (Carousel/Grid)
   - Titel der Aktivität
   - Ort
   - Bewertung + Anzahl Reviews
   - "Bestseller" / "Wahrscheinlich ausverkauft" Badge
   - Preis "Ab €X"
   - "Speichern" Button (Herz-Icon)

2. Schnellübersicht
   - Dauer
   - Sprachen
   - Gruppengröße
   - Abholservice (ja/nein)
   - Sofortbestätigung

3. Highlights (Bullet Points)
   - Hauptmerkmale der Tour

4. Beschreibung
   - Vollständige Beschreibung
   - Inklusive/Nicht inklusive
   - Wichtige Informationen
   - Treffpunkt/Karte

5. Verfügbarkeit & Buchung
   - Kalender
   - Zeitslots
   - Teilnehmerauswahl (Erwachsene/Kinder)
   - Add-ons (optional)
   - Preisinformationen
   - "Jetzt buchen" Button

6. Bewertungen & Fotos
   - Durchschnittsbewertung
   - Bewertungsverteilung
   - Kundenfotos
   - Gefilterte Reviews

7. Ähnliche Aktivitäten
```

### 2.4 Buchungsprozess

#### 2.4.1 Buchungs-Flow
```
1. Aktivität auswählen
   ↓
2. Datum & Zeit wählen
   ↓
3. Teilnehmer angeben
   - Erwachsene (Anzahl)
   - Kinder (Anzahl + Alter)
   - Säuglinge (falls relevant)
   ↓
4. Add-ons wählen (optional)
   - Transfer
   - Verpflegung
   - Ausrüstung
   ↓
5. Teilnehmerinformationen
   - Name
   - E-Mail
   - Telefon
   - Spezielle Anforderungen
   ↓
6. Zahlungsinformationen
   - Kreditkarte
   - PayPal
   - Apple Pay / Google Pay
   ↓
7. Buchungsbestätigung
   - Buchungsnummer
   - PDF-Voucher
   - E-Mail-Bestätigung
```

#### 2.4.2 Buchungsvalidierung
- Verfügbarkeitsprüfung (Real-time über API)
- Preisvalidierung
- Formularvalidierung
- Timeout-Warnung (Warenkorb-Reservierung läuft ab)

### 2.5 Benutzerdashboard

#### 2.5.1 Meine Buchungen
**Tabs:**
- Bevorstehende Buchungen
- Vergangene Buchungen
- Stornierte Buchungen

**Informationen pro Buchung:**
- Miniatur-Bild
- Aktivitätstitel
- Datum & Uhrzeit
- Buchungsnummer
- Status (Bestätigt/Ausstehend/Storniert)
- Anzahl Teilnehmer
- Gesamtpreis
- Aktionen: Details anzeigen, Stornieren, Voucher herunterladen

#### 2.5.2 Gespeicherte Aktivitäten (Favoriten)
- Grid/Listen-Ansicht
- Sortierung (Neueste, Name, Preis)
- "Zur Buchung" Quick-Action
- Entfernen-Funktion
- Teilen-Funktion

#### 2.5.3 Benachrichtigungen
- Buchungsbestätigungen
- Erinnerungen (24h vor Aktivität)
- Stornierungsbestätigungen
- Preisänderungen bei gespeicherten Aktivitäten
- Neue Aktivitäten in bevorzugten Kategorien

---

## 3. GetYourGuide Partner API Integration

### 3.1 Benötigte Endpoints

#### 3.1.1 Aktivitäten durchsuchen
```
GET /activities
GET /activities/{id}
GET /activities/search?query=Paris&category=museum
```

**Verwendung:**
- Hauptsuche
- Kategorieseiten
- Ähnliche Aktivitäten

#### 3.1.2 Verfügbarkeit prüfen
```
GET /availability?activity_id={id}&date={YYYY-MM-DD}
```

**Verwendung:**
- Kalenderansicht
- Buchungsprozess
- Real-time Validierung

#### 3.1.3 Preise abrufen
```
GET /pricing?activity_id={id}&participants={adult:2,child:1}
```

#### 3.1.4 Buchung erstellen
```
POST /bookings
{
  "activity_id": "12345",
  "date": "2026-03-15",
  "time_slot": "10:00",
  "participants": {
    "adults": 2,
    "children": 1
  },
  "customer": {
    "first_name": "Max",
    "last_name": "Mustermann",
    "email": "max@example.com",
    "phone": "+49123456789"
  },
  "payment": {...}
}
```

#### 3.1.5 Buchung stornieren
```
DELETE /bookings/{booking_id}
POST /bookings/{booking_id}/cancel
```

### 3.2 API-Datensynchronisation

**Caching-Strategie:**
- Aktivitätsliste: 1 Stunde Cache
- Verfügbarkeit: 5 Minuten Cache
- Preise: Real-time (kein Cache)
- Buchungen: Real-time

**Rate Limiting:**
- 1000 Requests/Stunde (wie in API-Docs angegeben)
- Exponential Backoff bei Errors
- Queue-System für Bulk-Updates

---

## 4. Technische Architektur

### 4.1 Frontend

#### 4.1.1 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS (bereits im Design verwendet)
- **State Management:** Zustand / Redux Toolkit
- **API-Client:** Axios / Fetch mit SWR
- **Forms:** React Hook Form + Zod Validation
- **Animations:** Framer Motion
- **Icons:** Material Symbols (bereits im Design)
- **Payments:** Stripe Elements

#### 4.1.2 Verzeichnisstruktur
```
/app
  /(auth)
    /login
    /register
    /forgot-password
  /(main)
    /page.tsx                    # Landing Page
    /search
      /page.tsx
    /activities
      /[id]
        /page.tsx                # Produktdetailseite
    /checkout
      /page.tsx
    /dashboard
      /bookings
      /favorites
      /settings
  /api
    /auth
    /activities
    /bookings
    /users
/components
  /ui                            # Wiederverwendbare UI-Komponenten
  /features                      # Feature-spezifische Komponenten
/lib
  /api                          # API-Client-Funktionen
  /hooks                        # Custom Hooks
  /utils                        # Hilfsfunktionen
  /validations                  # Zod Schemas
/types                          # TypeScript Definitionen
/public                         # Statische Assets
```

#### 4.1.3 Wichtige Komponenten

**Suchkomponente mit Autocomplete:**
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

interface SearchSuggestion {
  type: 'location' | 'activity' | 'category' | 'tour';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  icon: string;
}
```

**Aktivitätskarte:**
```typescript
interface ActivityCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  duration: string;
  badge?: 'bestseller' | 'likely-to-sell-out';
  isSaved: boolean;
  onSave: () => void;
}
```

#### 4.1.4 Responsive Design
- **Mobile First Approach**
- Breakpoints (Tailwind):
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

### 4.2 Backend (Supabase)

#### 4.2.1 Datenbankschema

**Tabelle: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- NULL für OAuth-Nutzer
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  birth_date DATE,
  profile_image_url TEXT,
  preferred_language VARCHAR(5) DEFAULT 'de',
  preferred_currency VARCHAR(3) DEFAULT 'EUR',
  auth_provider VARCHAR(50) DEFAULT 'email', -- 'email', 'google', 'apple', 'facebook'
  is_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
```

**Tabelle: saved_activities (Favoriten)**
```sql
CREATE TABLE saved_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_id VARCHAR(100) NOT NULL,  -- GetYourGuide Activity ID
  activity_data JSONB,  -- Gecachte Aktivitätsdaten
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_id)
);

CREATE INDEX idx_saved_activities_user ON saved_activities(user_id);
CREATE INDEX idx_saved_activities_activity ON saved_activities(activity_id);
```

**Tabelle: bookings**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- GetYourGuide Referenzen
  gyg_booking_reference VARCHAR(100) UNIQUE NOT NULL,
  activity_id VARCHAR(100) NOT NULL,
  
  -- Buchungsdetails
  activity_title VARCHAR(500) NOT NULL,
  activity_location VARCHAR(255),
  activity_image_url TEXT,
  
  booking_date DATE NOT NULL,
  booking_time TIME,
  
  -- Teilnehmer
  participants JSONB NOT NULL,  -- {"adults": 2, "children": 1, "infants": 0}
  participant_details JSONB,    -- Array mit Teilnehmerdaten
  
  -- Preise
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  price_breakdown JSONB,        -- Detaillierte Preisaufschlüsselung
  
  -- Add-ons
  addons JSONB,
  
  -- Status
  status VARCHAR(50) NOT NULL,  -- 'confirmed', 'pending', 'cancelled', 'completed'
  confirmation_status VARCHAR(50),
  
  -- Kontaktinformationen
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  special_requirements TEXT,
  
  -- Zahlungsinformationen
  payment_status VARCHAR(50),
  payment_method VARCHAR(50),
  payment_transaction_id VARCHAR(255),
  
  -- Voucher
  voucher_url TEXT,
  
  -- Stornierung
  cancellation_policy TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  refund_amount DECIMAL(10,2),
  
  -- Metadata
  booking_metadata JSONB,       -- Zusätzliche Daten von API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_gyg_ref ON bookings(gyg_booking_reference);
```

**Tabelle: reviews (Optional, für lokale Bewertungen)**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  activity_id VARCHAR(100) NOT NULL,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  
  photos JSONB,  -- Array von Bild-URLs
  
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,
  
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_activity ON reviews(activity_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

**Tabelle: notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,  -- 'booking_confirmation', 'reminder', 'cancellation', etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  action_url TEXT,
  action_label VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
```

**Tabelle: search_history (Optional)**
```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  search_query VARCHAR(255) NOT NULL,
  search_type VARCHAR(50),  -- 'location', 'activity', 'general'
  
  filters_applied JSONB,
  results_count INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
```

#### 4.2.2 Row Level Security (RLS) Policies

```sql
-- Users können nur ihre eigenen Daten sehen
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY users_update_own 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Saved Activities
ALTER TABLE saved_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_activities_all_own 
  ON saved_activities 
  USING (auth.uid() = user_id);

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookings_select_own 
  ON bookings FOR SELECT 
  USING (auth.uid() = user_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_all_own 
  ON notifications 
  USING (auth.uid() = user_id);
```

#### 4.2.3 Supabase Functions

**Edge Function: search-suggestions**
```typescript
// Autocomplete/Typeahead für Suche
// Kombiniert lokale Daten mit GetYourGuide API
export async function searchSuggestions(query: string) {
  // 1. Lokale Suche in gespeicherten Aktivitäten
  // 2. API-Aufruf zu GetYourGuide
  // 3. Merge & Deduplicate
  // 4. Kategorisieren & Sortieren
  // Return top 10 Ergebnisse
}
```

**Edge Function: process-booking**
```typescript
// Buchung erstellen und in DB speichern
export async function processBooking(bookingData) {
  // 1. GetYourGuide API Buchung
  // 2. Lokal in Supabase speichern
  // 3. Notification erstellen
  // 4. E-Mail versenden
  // 5. Voucher generieren
}
```

#### 4.2.4 Supabase Storage

**Buckets:**
- `profile-images` (Public)
- `vouchers` (Private)
- `review-photos` (Public)

### 4.3 API Layer (Backend Services)

#### 4.3.1 Server-Side API Routes (Next.js)

**Route: /api/activities/search**
```typescript
// GET /api/activities/search?q=Paris&category=museum
// Proxy zu GetYourGuide API mit Caching
```

**Route: /api/activities/[id]**
```typescript
// GET /api/activities/abc123
// Aktivitätsdetails mit Caching
```

**Route: /api/availability**
```typescript
// GET /api/availability?activityId=123&date=2026-03-15
// Real-time Verfügbarkeit
```

**Route: /api/bookings**
```typescript
// POST /api/bookings
// Buchung erstellen
// GET /api/bookings
// Alle Buchungen des Users
```

**Route: /api/favorites**
```typescript
// POST /api/favorites
// Aktivität speichern
// DELETE /api/favorites/:activityId
// Aktivität entfernen
```

#### 4.3.2 Middleware
- **Auth Middleware:** Prüft JWT Token
- **Rate Limiting:** Pro User/IP
- **Error Handling:** Einheitliche Error Responses
- **Logging:** Alle API-Calls loggen

### 4.4 Authentication Flow (Supabase Auth)

```
1. User Registration
   ├─ Supabase Auth: createUser()
   ├─ Profil in users-Tabelle erstellen
   └─ Verification E-Mail senden

2. Email Verification
   ├─ User klickt Link
   ├─ Supabase verifiziert
   └─ is_email_verified = true

3. Login
   ├─ Supabase Auth: signIn()
   ├─ JWT Token erhalten
   ├─ Session Cookie setzen
   └─ last_login_at updaten

4. OAuth Login
   ├─ Redirect zu OAuth Provider
   ├─ Callback zu Supabase
   ├─ User-Profil erstellen/aktualisieren
   └─ JWT Token erhalten

5. Session Management
   ├─ JWT in httpOnly Cookie
   ├─ Auto-Refresh Token
   └─ 7 Tage Gültigkeit
```

---

## 5. Design System & Styling

### 5.1 Farbschema (vom bestehenden Design übernommen)

```css
--primary: #2b8cee
--background-light: #f6f7f8
--background-dark: #101922
--card-dark: #1c2127
--card-hover: #283039
```

### 5.2 Typography

```css
Font Family: Space Grotesk
- Headings: 600-700
- Body: 400
- Small: 300
```

### 5.3 UI-Komponenten-Library

**Buttons:**
- Primary (bg-primary)
- Secondary (border + hover)
- Ghost (transparent)
- Icon-only

**Cards:**
- Activity Card
- Destination Card
- Booking Card

**Forms:**
- Input mit Glassmorphism
- Datepicker
- Select Dropdown
- Checkbox/Radio
- Toggle

**Modals:**
- Lightbox für Bilder
- Bestätigungsdialoge
- Buchungsmodal

**Feedback:**
- Toast Notifications
- Loading Spinners
- Skeleton Loaders
- Error States

### 5.4 Animationen (bereits im Design)

```javascript
fadeInUp: 0.8s ease-out
pulse-slow: 3s cubic-bezier
hover: 300ms transition
```

---

## 6. Drittanbieter-Integrationen

### 6.1 Zahlungsabwicklung

**Stripe Integration:**
- Payment Intent API
- 3D Secure Support
- Apple Pay / Google Pay
- Webhook für Zahlungsbestätigung

```typescript
// Stripe Payment Flow
1. Client: Create Payment Intent
2. Server: Stripe API → Client Secret
3. Client: Stripe Elements Formular
4. Client: Bestätigung
5. Webhook: Zahlung erfolgreich
6. Server: Buchung finalisieren
```

### 6.2 E-Mail-Service

**Transaktionale E-Mails (z.B. Resend, SendGrid):**
- Buchungsbestätigung
- Reminder (24h vorher)
- Stornierungsbestätigung
- Passwort-Reset
- Willkommens-E-Mail

**Templates:**
- Responsive HTML-E-Mails
- PDF-Voucher-Anhang
- Mehrsprachig

### 6.3 Maps & Geodaten

**Mapbox / Google Maps:**
- Treffpunkt-Karte auf Detailseite
- Suchergebnisse auf Karte
- Routenplanung (optional)

### 6.4 Analytics

- Google Analytics 4
- Hotjar (Heatmaps)
- Mixpanel (Event Tracking)

**Events tracken:**
- Suchvorgänge
- Aktivitätsaufrufe
- Buchungsabschlüsse
- Abbrüche im Checkout

---

## 7. Performance-Anforderungen

### 7.1 Ladezeiten
- **Initial Load:** < 2 Sekunden
- **Time to Interactive:** < 3 Sekunden
- **API Response:** < 500ms (95. Perzentil)

### 7.2 Optimierungen
- **Image Optimization:** Next.js Image Component
- **Code Splitting:** Route-based
- **Lazy Loading:** Bilder, Komponenten
- **Caching:** Redis/Vercel Cache
- **CDN:** Statische Assets

### 7.3 SEO
- Server-Side Rendering (SSR)
- Dynamische Meta-Tags
- Structured Data (JSON-LD)
- Sitemap.xml
- robots.txt

---

## 8. Sicherheitsanforderungen

### 8.1 Datenschutz
- DSGVO-konform
- SSL/TLS Verschlüsselung
- Passwort-Hashing (bcrypt)
- JWT-Tokens (httpOnly)
- XSS-Schutz
- CSRF-Schutz

### 8.2 Input Validation
- Client-side: Zod Schemas
- Server-side: Validation
- SQL Injection Prevention (Supabase prepared statements)
- Rate Limiting

### 8.3 PCI Compliance
- Keine Speicherung von Kartendaten
- Stripe PCI-zertifiziert

---

## 9. Testing-Strategie

### 9.1 Unit Tests
- Jest + React Testing Library
- Komponententests
- Utility-Funktionen
- API-Client

### 9.2 Integration Tests
- Cypress
- E2E User Flows
- Buchungsprozess
- Payment Flow (Stripe Test Mode)

### 9.3 API Tests
- Postman/Insomnia Collections
- GetYourGuide API Mock

---

## 10. Deployment & DevOps

### 10.1 Hosting
- **Frontend:** Vercel
- **Backend:** Supabase Cloud
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage

### 10.2 CI/CD
```
GitHub Actions:
1. Lint & Type Check
2. Unit Tests
3. Build
4. Deploy Preview (PRs)
5. Deploy Production (main branch)
```

### 10.3 Environments
- **Development:** Local + Supabase Dev
- **Staging:** Vercel Preview + Supabase Staging
- **Production:** Vercel + Supabase Prod

### 10.4 Monitoring
- Vercel Analytics
- Supabase Logs
- Sentry Error Tracking
- Uptime Monitoring (UptimeRobot)

---

## 11. Entwicklungs-Roadmap

### Phase 1: MVP (8-10 Wochen)
**Woche 1-2:** Setup & Authentifizierung
- Next.js Projekt initialisieren
- Supabase Setup
- Auth Flow implementieren
- Design System aufbauen

**Woche 3-4:** Suche & Aktivitäten
- GetYourGuide API Integration
- Suchfunktion mit Autocomplete
- Aktivitätsliste
- Filter & Sortierung

**Woche 5-6:** Produktdetails & Buchung
- Detailseite
- Verfügbarkeitskalender
- Buchungsformular
- Stripe Integration

**Woche 7-8:** Benutzerdashboard
- Meine Buchungen
- Favoriten
- Profil-Einstellungen

**Woche 9-10:** Testing & Launch
- E2E Tests
- Bug Fixes
- Performance Optimization
- Deployment

### Phase 2: Erweiterungen (4-6 Wochen)
- Bewertungssystem
- 2FA
- Push-Benachrichtigungen
- Erweiterte Filter
- Wishlist teilen
- Multi-Language Support

### Phase 3: Advanced Features (2-3 Monate)
- Mobile App (React Native)
- Gruppenbuchungen
- Gift Cards
- Treueprogramm
- Affiliate-System

---

## 12. API-Integration Details

### 12.1 GetYourGuide Partner API Endpoints

**Basis-URL:** `https://api.getyourguide.com/partner/v1`

**Authentifizierung:**
```
Headers:
  X-API-Key: {YOUR_PARTNER_API_KEY}
  Content-Type: application/json
```

**Wichtige Endpoints:**

```typescript
// Aktivitäten suchen
GET /activities
Query Parameters:
  - q: string (Suchbegriff)
  - location_id: number
  - category_id: number
  - page: number
  - limit: number (max 50)
  - sort_by: 'popularity' | 'price_asc' | 'price_desc' | 'rating'
  
Response:
{
  "data": [
    {
      "activity_id": "12345",
      "title": "Eiffelturm Skip-the-Line Tour",
      "short_description": "...",
      "location": {
        "city": "Paris",
        "country": "France",
        "coordinates": {...}
      },
      "images": [...],
      "price": {
        "from": 55.00,
        "currency": "EUR"
      },
      "rating": {
        "average": 4.7,
        "count": 3204
      },
      "duration": "3h",
      "categories": [...]
    }
  ],
  "pagination": {
    "total": 1240,
    "page": 1,
    "per_page": 20
  }
}

// Aktivitätsdetails
GET /activities/{activity_id}

// Verfügbarkeit prüfen
GET /activities/{activity_id}/availability
Query Parameters:
  - from_date: YYYY-MM-DD
  - to_date: YYYY-MM-DD
  - participants: adults:2,children:1

// Buchung erstellen
POST /bookings
Body:
{
  "activity_id": "12345",
  "option_id": "67890",  // Spezifische Tour-Option
  "date": "2026-03-15",
  "time_slot_id": "morning",
  "participants": {
    "adults": 2,
    "children": 1,
    "infants": 0
  },
  "customer": {
    "first_name": "Max",
    "last_name": "Mustermann",
    "email": "max@example.com",
    "phone": "+49 123 456789",
    "country_code": "DE"
  },
  "payment_details": {
    // Stripe Payment Intent ID
    "payment_intent": "pi_xxxx"
  }
}

// Buchung abrufen
GET /bookings/{booking_reference}

// Buchung stornieren
POST /bookings/{booking_reference}/cancel
```

### 12.2 Caching-Strategie für API-Daten

```typescript
// lib/api/cache-config.ts

export const CACHE_DURATIONS = {
  ACTIVITIES_LIST: 3600,        // 1 Stunde
  ACTIVITY_DETAILS: 1800,       // 30 Minuten
  AVAILABILITY: 300,            // 5 Minuten
  PRICING: 0,                   // Kein Cache (Real-time)
  SEARCH_SUGGESTIONS: 600,      // 10 Minuten
  CATEGORIES: 86400,            // 24 Stunden
};

// Verwendung mit SWR
const { data, error } = useSWR(
  `/api/activities/${id}`,
  fetcher,
  { refreshInterval: CACHE_DURATIONS.ACTIVITY_DETAILS * 1000 }
);
```

### 12.3 Error Handling für API-Aufrufe

```typescript
// lib/api/error-handler.ts

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

export async function handleAPIResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 400:
        throw new APIError(400, error.message, 'INVALID_REQUEST');
      case 401:
        throw new APIError(401, 'Unauthorized', 'AUTH_REQUIRED');
      case 404:
        throw new APIError(404, 'Not Found', 'NOT_FOUND');
      case 429:
        throw new APIError(429, 'Rate Limit', 'RATE_LIMIT');
      case 500:
        throw new APIError(500, 'Server Error', 'SERVER_ERROR');
      default:
        throw new APIError(response.status, 'Unknown Error');
    }
  }
  
  return response.json();
}
```

---

## 13. Benutzerfreundlichkeit (UX)

### 13.1 Loading States

**Skeleton Screens:**
```typescript
// Während Aktivitäten laden
<div className="grid grid-cols-3 gap-6">
  {[1,2,3,4,5,6].map(i => (
    <div key={i} className="animate-pulse">
      <div className="bg-gray-700 aspect-[4/5] rounded-2xl" />
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  ))}
</div>
```

**Progressive Loading:**
- Bilder: Low-quality Placeholder → High-quality
- Daten: Cached → Fresh

### 13.2 Empty States

**Keine Suchergebnisse:**
```
Icon: 🔍
Titel: "Keine Ergebnisse gefunden"
Text: "Versuche es mit anderen Suchbegriffen oder weniger Filtern"
CTA: "Filter zurücksetzen"
```

**Keine gespeicherten Aktivitäten:**
```
Icon: ❤️
Titel: "Noch keine Favoriten"
Text: "Speichere Aktivitäten, die dich interessieren"
CTA: "Aktivitäten entdecken"
```

### 13.3 Fehlermeldungen

**User-Friendly Errors:**
```typescript
const ERROR_MESSAGES = {
  NETWORK_ERROR: "Verbindung fehlgeschlagen. Bitte prüfe deine Internetverbindung.",
  NOT_AVAILABLE: "Diese Aktivität ist leider nicht mehr verfügbar.",
  BOOKING_FAILED: "Buchung fehlgeschlagen. Bitte versuche es erneut.",
  PAYMENT_FAILED: "Zahlung nicht erfolgreich. Bitte prüfe deine Zahlungsdaten.",
};
```

### 13.4 Accessibility (a11y)

- **WCAG 2.1 Level AA Compliance**
- Keyboard Navigation
- Screen Reader Support
- Focus Indicators
- Alt-Texte für Bilder
- ARIA Labels
- Color Contrast (min. 4.5:1)

---

## 14. Internationalisierung (i18n)

### 14.1 Unterstützte Sprachen (Phase 1)
- Deutsch (DE) - Default
- Englisch (EN)
- Französisch (FR)
- Spanisch (ES)

### 14.2 Implementation

```typescript
// next-i18next.config.js
export default {
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'fr', 'es'],
  },
};

// Verwendung
import { useTranslation } from 'next-i18next';

function Component() {
  const { t } = useTranslation('common');
  return <h1>{t('welcome')}</h1>;
}
```

### 14.3 Währungsformatierung

```typescript
const formatPrice = (amount: number, currency: string, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Beispiel: formatPrice(55.00, 'EUR', 'de-DE') → "55,00 €"
```

---

## 15. Analytics & Tracking

### 15.1 Key Performance Indicators (KPIs)

**Business Metrics:**
- Conversion Rate (Suche → Buchung)
- Average Order Value
- Buchungsrate
- Stornierungsrate
- Customer Lifetime Value

**User Engagement:**
- Sitzungsdauer
- Seiten pro Sitzung
- Bounce Rate
- Wiederkehrende Besucher

**Technical Metrics:**
- API Response Times
- Error Rate
- Uptime

### 15.2 Event Tracking

```typescript
// lib/analytics.ts

export const trackEvent = (eventName: string, properties?: object) => {
  // Google Analytics
  gtag('event', eventName, properties);
  
  // Mixpanel
  mixpanel.track(eventName, properties);
};

// Verwendung
trackEvent('activity_viewed', {
  activity_id: '12345',
  activity_title: 'Eiffelturm Tour',
  price: 55.00,
  category: 'Culture'
});

trackEvent('booking_completed', {
  booking_id: 'abc-123',
  total_amount: 110.00,
  participants: 2
});
```

---

## 16. Compliance & Legal

### 16.1 DSGVO-Anforderungen

**Datenschutzerklärung:**
- Welche Daten werden gesammelt
- Zweck der Datenverarbeitung
- Datenweitergabe (GetYourGuide, Stripe)
- Speicherdauer
- Nutzerrechte (Auskunft, Löschung)

**Cookie-Consent:**
- Cookie-Banner beim ersten Besuch
- Kategorien: Notwendig, Funktional, Analytics, Marketing
- Opt-in für nicht-essentielle Cookies

**Recht auf Vergessenwerden:**
- Account-Löschfunktion
- Automatische Löschung aller personenbezogenen Daten
- 30-Tage Widerrufsfrist

### 16.2 AGB (Allgemeine Geschäftsbedingungen)

Wichtige Punkte:
- Buchungsbedingungen
- Stornierungsrichtlinien
- Haftungsausschluss
- Streitbeilegung
- Anwendbares Recht

### 16.3 Impressum

Pflichtangaben nach § 5 TMG

---

## 17. Support & Kundenservice

### 17.1 Help Center

**FAQ-Kategorien:**
- Buchung & Bezahlung
- Stornierung & Umbuchung
- Vor der Tour
- Während der Tour
- Nach der Tour
- Technische Probleme

### 17.2 Kontaktmöglichkeiten

- **E-Mail Support:** support@yourplatform.de
- **Live Chat:** (Phase 2) Intercom/Zendesk
- **Telefon-Hotline:** (Optional)
- **Response Time:** < 24 Stunden

### 17.3 Self-Service

- Buchungen selbst verwalten
- Voucher erneut herunterladen
- Rechnungen generieren
- Kontaktdaten ändern

---

## 18. Maintenance & Updates

### 18.1 Regelmäßige Wartung

**Wöchentlich:**
- Dependency Updates prüfen
- Security Patches
- Performance Monitoring Review

**Monatlich:**
- Database Backups verifizieren
- Analytics Reports
- User Feedback Review

**Quartalsweise:**
- Major Feature Releases
- A/B Tests auswerten
- SEO Audit

### 18.2 Backup-Strategie

**Supabase:**
- Automatische tägliche Backups
- Point-in-Time Recovery (7 Tage)
- Geo-Redundanz

**Vercel:**
- Automatische Deployments versioniert
- Rollback in < 1 Minute

---

## 19. Erfolgskriterien

### 19.1 Launch-Ziele (3 Monate nach MVP)

- 1.000 registrierte Nutzer
- 100 Buchungen
- < 5% Error Rate
- > 90% Uptime
- < 3s Page Load Time

### 19.2 Langfristige Ziele (1 Jahr)

- 10.000 registrierte Nutzer
- 2.000 Buchungen/Monat
- > 99.5% Uptime
- 4.5+ Average User Rating
- Top 10 Ranking für "Touren buchen" (SEO)

---

## 20. Risiken & Mitigation

### 20.1 Technische Risiken

**GetYourGuide API Downtime:**
- Mitigation: Caching, Error Handling, Status Page

**Hohe Last:**
- Mitigation: Auto-Scaling (Vercel), Database Pooling

**Datenverlust:**
- Mitigation: Regelmäßige Backups, Replikation

### 20.2 Business Risiken

**Abhängigkeit von GetYourGuide:**
- Mitigation: Vertragsverhandlung, SLA

**Konkurrenz:**
- Mitigation: Unique Value Proposition, UX Excellence

**Regulatorische Änderungen:**
- Mitigation: Legal Review, Compliance Monitoring

---

## Anhänge

### A. Technologie-Stack Übersicht

```
Frontend:
├─ Next.js 14
├─ TypeScript
├─ Tailwind CSS
├─ Zustand/Redux
├─ React Hook Form
├─ Zod
├─ SWR
└─ Framer Motion

Backend:
├─ Supabase
│  ├─ PostgreSQL
│  ├─ Auth
│  ├─ Storage
│  └─ Edge Functions
└─ Next.js API Routes

Third-Party:
├─ GetYourGuide Partner API
├─ Stripe
├─ Resend/SendGrid
├─ Mapbox
└─ Analytics (GA4, Mixpanel)

DevOps:
├─ Vercel
├─ GitHub Actions
├─ Sentry
└─ UptimeRobot
```

### B. Datenbank ER-Diagramm

```
users (1) ───< (N) saved_activities
users (1) ───< (N) bookings
users (1) ───< (N) notifications
users (1) ───< (N) reviews
bookings (1) ───< (N) reviews
```

### C. User Journey Map

```
1. Entdeckung
   ├─ Landing Page
   ├─ Suche
   └─ Kategorien

2. Auswahl
   ├─ Suchergebnisse
   ├─ Filter
   └─ Detailseite

3. Buchung
   ├─ Datum & Teilnehmer
   ├─ Kontaktdaten
   └─ Zahlung

4. Bestätigung
   ├─ E-Mail
   ├─ Voucher
   └─ Dashboard

5. Erlebnis
   ├─ Reminder
   ├─ Aktivität
   └─ Bewertung

6. Wiederkehr
   ├─ Gespeicherte Aktivitäten
   ├─ Personalisierte Vorschläge
   └─ Neue Buchung
```

---

**Ende des PRD**

**Nächste Schritte:**
1. PRD-Review mit Stakeholdern
2. Design-Mockups erstellen (Figma)
3. Technisches Setup (Repositories, Supabase)
4. Sprint Planning für Phase 1
5. Development Start

**Kontakt für Rückfragen:**
[Ihr Name/Team]
[E-Mail]