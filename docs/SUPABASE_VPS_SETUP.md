# Supabase Self-Hosted Installation (VPS)

> Diese Anleitung zeigt, wie du Supabase auf deinem eigenen VPS installierst.

---

## Voraussetzungen

- **VPS** mit mindestens:
  - 2 GB RAM (4 GB empfohlen)
  - 20 GB Speicher
  - Ubuntu 22.04 LTS (oder ähnlich)
- **Docker** und **Docker Compose** installiert
- **Domain** (optional, aber empfohlen für HTTPS)

---

## Schritt 1: VPS vorbereiten

### 1.1 SSH-Verbindung zum VPS

```bash
ssh root@DEINE_VPS_IP
```

### 1.2 System aktualisieren

```bash
apt update && apt upgrade -y
```

### 1.3 Docker installieren

```bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
apt install docker-compose-plugin -y

# Prüfen
docker --version
docker compose version
```

---

## Schritt 2: Supabase herunterladen

```bash
# Verzeichnis erstellen
mkdir -p /opt/supabase
cd /opt/supabase

# Supabase Docker-Dateien klonen
git clone --depth 1 https://github.com/supabase/supabase.git
cd supabase/docker
```

---

## Schritt 3: Konfiguration anpassen

### 3.1 `.env` Datei erstellen

```bash
cp .env.example .env
nano .env
```

### 3.2 Wichtige Variablen ändern

Ersetze die Platzhalter in `.env`:

```env
############
# Secrets - ÄNDERE DIESE!
############

# Generiere sichere Passwörter mit: openssl rand -base64 32

POSTGRES_PASSWORD=DEIN_SICHERES_POSTGRES_PASSWORD
JWT_SECRET=DEIN_SICHERES_JWT_SECRET_MIN_32_ZEICHEN
ANON_KEY=GENERIERTER_ANON_KEY
SERVICE_ROLE_KEY=GENERIERTER_SERVICE_ROLE_KEY

############
# URLs
############

# Deine Domain oder VPS-IP
SITE_URL=https://supabase.deine-domain.de
API_EXTERNAL_URL=https://supabase.deine-domain.de

# Oder für IP-basiert (ohne HTTPS):
# SITE_URL=http://DEINE_VPS_IP:8000
# API_EXTERNAL_URL=http://DEINE_VPS_IP:8000
```

### 3.3 JWT Keys generieren

Gehe zu: https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys

Oder verwende dieses Tool:
```bash
# Installiere Node.js falls nicht vorhanden
apt install nodejs npm -y

# Generiere Keys
npx supabase-jwt-generator --secret "DEIN_JWT_SECRET"
```

---

## Schritt 4: Supabase starten

```bash
cd /opt/supabase/supabase/docker

# Starten
docker compose up -d

# Logs prüfen
docker compose logs -f
```

### Gestartete Services:

| Service | Port | Beschreibung |
|---------|------|--------------|
| Kong (API Gateway) | 8000 | Haupt-API Endpoint |
| Supabase Studio | 3000 | Admin Dashboard |
| PostgreSQL | 5432 | Datenbank |
| GoTrue | 9999 | Auth Service |
| Realtime | 4000 | Realtime Subscriptions |
| Storage | 5000 | File Storage |

---

## Schritt 5: Zugriff testen

### 5.1 Supabase Studio öffnen

```
http://DEINE_VPS_IP:3000
```

**Login:**
- Email: Wie in `.env` konfiguriert (default: supabase)
- Password: Wie in `.env` konfiguriert

### 5.2 API testen

```bash
curl http://DEINE_VPS_IP:8000/rest/v1/ \
  -H "apikey: DEIN_ANON_KEY" \
  -H "Authorization: Bearer DEIN_ANON_KEY"
```

---

## Schritt 6: Firewall konfigurieren (Optional aber empfohlen)

```bash
# UFW aktivieren
ufw allow OpenSSH
ufw allow 8000   # Supabase API
ufw allow 3000   # Supabase Studio (nur für Admin)
ufw enable
```

---

## Schritt 7: HTTPS mit Nginx + Let's Encrypt (Empfohlen)

### 7.1 Nginx installieren

```bash
apt install nginx certbot python3-certbot-nginx -y
```

### 7.2 Nginx Konfiguration erstellen

```bash
nano /etc/nginx/sites-available/supabase
```

```nginx
server {
    listen 80;
    server_name supabase.deine-domain.de;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.3 Aktivieren und SSL einrichten

```bash
ln -s /etc/nginx/sites-available/supabase /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# SSL Zertifikat
certbot --nginx -d supabase.deine-domain.de
```

---

## Schritt 8: Verbindung von Next.js App

### 8.1 Supabase Client installieren (in deinem Projekt)

```bash
npm install @supabase/supabase-js
```

### 8.2 `.env` in deinem Next.js Projekt aktualisieren

```env
# Supabase (Self-Hosted)
NEXT_PUBLIC_SUPABASE_URL=https://supabase.deine-domain.de
NEXT_PUBLIC_SUPABASE_ANON_KEY=DEIN_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=DEIN_SERVICE_ROLE_KEY
```

### 8.3 Supabase Client erstellen

Erstelle `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Nützliche Befehle

```bash
# Status prüfen
cd /opt/supabase/supabase/docker
docker compose ps

# Logs anzeigen
docker compose logs -f

# Neustart
docker compose restart

# Stoppen
docker compose down

# Update
git pull
docker compose pull
docker compose up -d
```

---

## Troubleshooting

### Problem: "Connection refused"
```bash
# Prüfe ob Container laufen
docker compose ps

# Prüfe Logs
docker compose logs db
docker compose logs kong
```

### Problem: "Invalid JWT"
- Stelle sicher, dass `JWT_SECRET`, `ANON_KEY` und `SERVICE_ROLE_KEY` korrekt generiert wurden.

### Problem: Hoher RAM-Verbrauch
- Supabase braucht ~1.5-2GB RAM
- Prüfe mit `htop` oder `docker stats`

---

## Nächste Schritte

Nach erfolgreicher Installation:
1. Datenbank-Schema erstellen (Products, Availability, etc.)
2. Sync-Jobs für Viator implementieren
3. Frontend auf Supabase umstellen

---

*Erstellt: 2026-01-16*
