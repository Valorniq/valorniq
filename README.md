# Valorniq 3.1 — Cline-Ready Foundation

Valorniq is a modular ERP + CRM platform for businesses, enterprises, nonprofits, and other organizations managing financial and non-monetary assets.

This repository is a **Cline-ready engineering baseline**. It keeps the existing product UI and modules while removing several dangerous prototype patterns around credentials, authentication, and deployment.

## Current architecture

```text
React + TypeScript + Tailwind
        |
        | authenticated requests
        v
Valorniq Express API
        |
        +--> ARIS / Gemini (server-side key)
        |
        +--> future domain/application services
        |
        v
Firebase / future production database
```

### Important deployment rule

**GitHub Pages hosts the frontend only.**

It cannot safely host `server.ts`, Gemini API keys, Firebase Admin credentials, or other server secrets.

The intended deployment is:

- GitHub Pages → React preview/frontend
- Separate backend host → Express API
- Firebase → Authentication + database
- GitHub Actions → CI + Pages deployment

## Secrets

Never commit secrets.

Frontend `VITE_*` values are build-time browser configuration. They are visible to users after the site is built. Firebase web configuration is normally public; Firebase Authentication and Firestore Rules provide the security boundary.

**Never put `GEMINI_API_KEY` in a `VITE_*` variable.**

Server-only secrets:

- `GEMINI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

Frontend configuration:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_API_BASE_URL`

See [`docs/GITHUB_SETUP.md`](docs/GITHUB_SETUP.md).

## Local development

```bash
cp .env.example .env.local
npm install
npm run lint
npm run build
npm run dev
```

The Vite frontend is available through the Express development server. Vite also proxies `/api` to `http://localhost:3000` when running the frontend directly.

## Cline

Read these files before making architectural changes:

- [`AGENTS.md`](AGENTS.md)
- [`.clinerules/valorniq.md`](.clinerules/valorniq.md)
- [`prompts/ACT-001-foundation.md`](prompts/ACT-001-foundation.md)

Cline must work incrementally. It should inspect first, make small changes, run checks, and never rewrite the application without an explicit reason.

## MVP direction

1. Secure authentication and tenant foundation
2. CRM: companies, contacts, leads, pipeline
3. Finance: invoices, payments, expenses, accounting foundation
4. Inventory and sales
5. Executive dashboard
6. RBAC and auditability
7. API-first domain architecture
8. ARIS structured tools
9. Testing and production hardening

## Known transitional area

Some business state in the current UI still uses React state/localStorage. That state is **not a production source of truth**. It exists so the existing prototype remains usable while the persistence/API architecture is migrated.

Do not hide this limitation. The next engineering passes should move authoritative business operations behind authenticated domain services and a properly tenant-scoped persistence layer.

## Security position

This project does not claim SOC 2, GAAP/IFRS compliance, production MFA, or production-grade multi-tenant isolation merely because UI labels mention them.

Those claims require real technical controls and verification.
