# GitHub + Cline Setup

## 1. Create the repository

Create a new GitHub repository and push this project to the `main` branch.

Do not commit `.env`, service-account JSON, `node_modules`, or `dist`.

## 2. Enable GitHub Pages

In GitHub:

1. Settings → Pages.
2. Set the source to **GitHub Actions**.
3. Push to `main`.
4. The `pages.yml` workflow builds and deploys the frontend.

The preview URL will look like:

`https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

GitHub Pages only hosts the React frontend. It does **not** host `server.ts`.

## 3. Add GitHub Secrets

Repository → Settings → Secrets and variables → Actions → New repository secret.

Add:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_API_BASE_URL`

Important: `VITE_*` values are embedded into the browser build. They are not secret after deployment. Firebase web configuration is normally public; actual protection comes from Firebase Auth and Firestore Rules.

**Never add `GEMINI_API_KEY` to the Pages workflow.**

`GEMINI_API_KEY` belongs only on the backend deployment.

For a production backend, also configure:

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `GEMINI_API_KEY`
- `CORS_ORIGINS`

## 4. Local development

Copy `.env.example` to `.env.local` and fill in the Firebase web configuration.

For local ARIS authentication during development, configure a Firebase Admin service account and set:

`ALLOW_DEV_API_WITHOUT_AUTH=true`

only when intentionally running an isolated local development server without Admin credentials. Never enable this in production.

Run:

```bash
npm install
npm run lint
npm run build
npm run dev
```

## 5. Cline

Open the repository in VS Code and install Cline.

Read `prompts/ACT-001-foundation.md` before giving Cline its first task.

The repository also contains the same rules in `AGENTS.md`. Cline must treat those rules as higher priority than convenience.

## 6. Firebase setup

In Firebase:

- Enable Email/Password authentication if desired.
- Enable Google authentication if desired.
- Configure the GitHub Pages domain as an authorized domain.
- Deploy and review Firestore Rules.
- Do not rely on UI role checks for security.

## Architecture rule

Frontend → authenticated API → domain services → persistence.

Do not put provider secrets in React code.
