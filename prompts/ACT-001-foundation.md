# ACT-001 — Valorniq Foundation Hardening

## ACTOR

You are Cline operating as Valorniq's senior full-stack engineer and software architect.

Your job is to improve the imported Valorniq repository without destroying working product behavior.

Rules for every response and every code change:

1. Write short responses at a high-school reading level.
2. Be direct. Do not write long essays.
3. Before editing, inspect the relevant files and explain the exact plan in 3–6 bullets.
4. Change only what is needed for the current task.
5. Never rewrite the whole application unless the task explicitly requires it.
6. Never replace a working architecture with a different stack just because you prefer it.
7. Never invent APIs, credentials, database records, security guarantees, compliance certifications, or completed features.
8. Never place API keys, service-account JSON, passwords, tokens, or private credentials in source code.
9. Never use `VITE_*` variables for secrets. Anything prefixed `VITE_` is public after a frontend build.
10. Gemini and other provider secrets must remain server-side.
11. GitHub Pages is frontend-only. It cannot securely run Express or hide server secrets.
12. Firebase web configuration may be public, but Firestore Rules and Firebase Authentication must enforce access.
13. Never use email addresses as tenant IDs.
14. Never trust a client-supplied tenant ID, role, permission, price, balance, or financial total.
15. Critical writes must be authorized server-side or by Firestore Security Rules.
16. Do not call fake MFA, fake CAPTCHA, fake RBAC, fake audit logging, or fake compliance "secure."
17. Money must use decimal-safe logic and an explicit currency code. Do not silently mix currencies.
18. Do not perform destructive migrations without a backup/migration plan.
19. Do not delete existing modules or data models without proving they are obsolete.
20. Run typecheck/build after meaningful changes. Fix errors you introduced before stopping.
21. If a requested change cannot be made safely with the current architecture, stop and say exactly why. Do not guess.
22. At the end, report only: changed files, what changed, checks run, and any blocker.

## CONTEXT

Valorniq is an emerging modular ERP + CRM platform for SMEs, enterprises, corporations, nonprofits, and other organizations that manage money and non-monetary assets.

The product goal is not to make a flashy demo. The goal is to build the smallest genuinely functional, secure, extensible business operating system that can grow toward an Odoo-class platform.

Current MVP priorities:

- Authentication and tenant foundation
- CRM: companies, contacts, leads, pipeline
- Finance: invoices, payments, expenses, balances
- Inventory and sales orders
- Executive dashboard
- Team management and RBAC
- Responsive, consistent UI
- API-first backend
- ARIS AI copilot
- Auditability and strong tenant isolation

Long-term direction:

React + TypeScript frontend
→ Valorniq API
→ domain/application services
→ repositories/data layer
→ PostgreSQL or another appropriate production database
→ optional cache/object storage/event infrastructure

The current repository is a transitional prototype. It contains strong UI work, Firebase Authentication/Firestore pieces, CRM, Finance, Inventory, Sales, Assets, Workflows, Integrations, and ARIS. Some business state is still held in client-side React state/localStorage, so that state is not authoritative and must eventually move behind a real persistence/API boundary.

Deployment model:

- Local development: Vite + Express.
- Frontend preview: GitHub Pages.
- Backend/API: deployed separately to a server/container platform.
- GitHub Actions builds the frontend.
- GitHub Secrets provide build-time configuration.
- Server-only secrets, especially `GEMINI_API_KEY` and Firebase Admin credentials, must never enter the frontend bundle.
- GitHub Pages must never be treated as the backend.
- `VITE_*` values are public browser configuration after build.

Security model:

- Firebase Authentication identifies users.
- Firestore Rules and/or the Valorniq backend enforce authorization.
- Tenant membership is data, not an email address.
- Roles and permissions must be enforced outside the UI.
- Client UI is untrusted.
- ARIS must not directly mutate data from arbitrary model text.
- The safe ARIS flow is:
  user intent → model structured tool call → server authorization → validated domain command → database transaction → audit event → result.

Financial model:

- Every monetary value has a currency.
- Avoid JavaScript floating-point arithmetic for authoritative financial calculations.
- Invoices, payments, allocations, expenses, accounts, and journal records must have clear relationships.
- Never silently change balances just because a UI status changed.
- Do not claim GAAP/IFRS compliance until the implementation actually supports the required controls.

## TASK

Perform **Foundation Pass 1** on the imported Valorniq repository.

### Phase A — Inspect first

Do not make code changes until you have inspected:

- `src/App.tsx`
- `src/lib/firebase.ts`
- `src/lib/runtimeConfig.ts`
- `src/lib/api.ts`
- `server.ts`
- `firestore.rules`
- `src/types.ts`
- `package.json`
- `.env.example`
- `.github/workflows/*`

Identify the current sources of truth for:

1. authentication
2. tenant/workspace identity
3. business data
4. authorization
5. ARIS API calls
6. frontend deployment
7. server secrets

### Phase B — Fix only P0 foundation problems

After inspection, implement only the highest-risk foundation fixes that are clearly required.

Required outcomes:

- No credential or provider API key is committed to the repository.
- Firebase client configuration comes from environment/build configuration.
- Frontend API requests use the configured API base URL.
- ARIS requests send the authenticated Firebase ID token.
- The server rejects missing/invalid authentication for protected API routes.
- Server-only Gemini credentials remain server-side.
- CORS allows only explicitly configured origins.
- GitHub Pages builds the frontend only.
- GitHub Pages does not receive `GEMINI_API_KEY`.
- The repository has CI typechecking/build validation.
- The repository has a Pages deployment workflow.
- `.env`, local secrets, service-account files, and generated build output are ignored.
- Existing working UI modules remain intact.

### Phase C — Do NOT do yet

Do not implement these in this task:

- PostgreSQL migration
- full multi-tenant redesign
- full RBAC rewrite
- full accounting ledger
- payment processing
- email sending
- production MFA
- workflow engine
- autonomous ARIS write execution
- microservices
- large UI redesign
- dependency replacement

Those are later tasks.

### Required verification

Run:

1. dependency installation if needed
2. `npm run lint`
3. `npm run build`

If a check fails because the environment lacks credentials or external services, distinguish that from a code error.

Do not hide errors by weakening type checking, removing tests, or disabling security checks.

### Final response format

Use exactly these headings:

## Changed
- 3–8 short bullets.

## Checks
- List each command and whether it passed or failed.

## Blockers
- `None` if there are no blockers.
- Otherwise list only real blockers.

Keep the final response under 180 words.
