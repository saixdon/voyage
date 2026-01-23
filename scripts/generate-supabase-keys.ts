/**
 * Script to generate Supabase JWT keys
 * Run with: npx tsx scripts/generate-supabase-keys.ts
 */

import * as crypto from 'crypto';

// Your JWT Secret from Supabase
const JWT_SECRET = 'cEUoIFsXUXxo7NfC9OAV1DBVMwid2NdNchQHjexm9A';

function base64url(str: string): string {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function generateJWT(payload: object): string {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));

    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Generate ANON_KEY
const anonPayload = {
    role: 'anon',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

// Generate SERVICE_ROLE_KEY
const serviceRolePayload = {
    role: 'service_role',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const ANON_KEY = generateJWT(anonPayload);
const SERVICE_ROLE_KEY = generateJWT(serviceRolePayload);

console.log('='.repeat(60));
console.log('NEUE SUPABASE KEYS (passend zu deinem JWT_SECRET)');
console.log('='.repeat(60));
console.log('');
console.log('ANON_KEY=');
console.log(ANON_KEY);
console.log('');
console.log('SERVICE_ROLE_KEY=');
console.log(SERVICE_ROLE_KEY);
console.log('');
console.log('='.repeat(60));
console.log('');
console.log('NÄCHSTE SCHRITTE:');
console.log('1. Kopiere diese Keys in /opt/supabase/supabase/docker/.env auf dem Server');
console.log('2. Starte Supabase neu: docker compose down && docker compose up -d');
console.log('3. Kopiere die Keys auch in deine lokale .env');
console.log('');
