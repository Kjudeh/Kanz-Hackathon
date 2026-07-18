# Gotenberg — CV PDF renderer

Naatiq renders the bilingual CV by POSTing HTML to a Gotenberg (Chromium) service.
Deploy it once, then set the Supabase secret `GOTENBERG_URL` to its public URL.

`generate-cv` calls `${GOTENBERG_URL}/forms/chromium/convert/html`, so `GOTENBERG_URL`
should be just the base URL with **no trailing slash** (e.g. `https://xxx.up.railway.app`).

## Option A — Railway (recommended, ~2 min)

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
   → pick `Kanz-Hackathon`.
2. In the service settings → **Root Directory**, set `infra/gotenberg` (so it builds this
   Dockerfile).
3. Wait for the build/deploy to finish (green).
4. **Settings → Networking → Generate Domain**. Copy the `https://…up.railway.app` URL.
5. Set the Supabase secret `GOTENBERG_URL` to that URL.

Railway injects `$PORT`; the Dockerfile binds Gotenberg to it automatically.

## Option B — Fly.io

```bash
cd infra/gotenberg
fly launch --no-deploy --copy-config --name naatiq-gotenberg
fly deploy
```
Your URL is `https://naatiq-gotenberg.fly.dev` → set `GOTENBERG_URL` to it.

## Verify

Open the URL in a browser — Gotenberg returns a small info page / 200. Once
`GOTENBERG_URL` is set, tell me and I'll run an end-to-end CV render and check the logs.

## Note on access

This deploys Gotenberg without authentication (fine for a demo). To lock it down later,
enable basic auth on the container (`GOTENBERG_API_BASIC_AUTH_USERNAME` /
`GOTENBERG_API_BASIC_AUTH_PASSWORD`) and I'll add the matching header in `render.ts`.
