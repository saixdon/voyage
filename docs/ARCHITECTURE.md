# System Architecture

## Do we need a separate Backend?
**No.** This project uses **Next.js**, which is a "Full Stack" framework. This means it handles both:
1.  **Frontend**: What the user sees (React components, Pages).
2.  **Backend**: Server-side logic (API Routes).

## Why do we have `app/api/...`?
Even though we don't need a *separate* server (like Python/Django or Node/Express), we **MUST** use the server-side API routes provided by Next.js (`app/api/search`, `app/api/activity`) for these critical reasons:

### 1. Security (Crucial)
*   The **Viator API Key** (`VIATOR_API_KEY`) is a secret credential.
*   If we called Viator directly from the frontend (Client Components), this key would be visible in the user's browser "Network" tab.
*   Hackers could steal your key and use your quota or charge your account.
*   **Solution**: We store the key in `.env` (server-only) and only the server uses it. The frontend asks our server -> our server adds the key -> calls Viator.

### 2. CORS (Cross-Origin Resource Sharing)
*   Web browsers block requests from one domain (e.g., `your-site.com`) to another (e.g., `api.viator.com`) for security, unless the API explicitly allowlists you.
*   Server-to-Server requests do not have this limitation.
*   By using our API routes as a "Proxy", we bypass these browser errors.

### 3. Data Transformation
*   The Viator API returns complex, raw data.
*   Our API routes clean this data up before sending it to the frontend.
*   This keeps the frontend code clean and fast.

## Diagram
`Browser (User)`  <-- Public Data -->  `Next.js Server (API Routes)`  <-- Secret Key -->  `Viator API`
