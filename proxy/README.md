# Mirror Proxy

Use this Cloudflare Worker as the backend for a GitHub Pages frontend.

## Architecture

- GitHub Pages hosts the static game
- Cloudflare Worker exposes `POST /api/mirror-chat`
- The Worker stores `OPENROUTER_API_KEY` as a secret
- The browser calls the Worker, never OpenRouter directly

## Files

- `cloudflare-worker.js`: Worker source
- `wrangler.toml`: Worker config template

## Required setup

1. Install Wrangler:
   `npm install -g wrangler`
2. Login:
   `wrangler login`
3. Set the OpenRouter secret:
   `wrangler secret put OPENROUTER_API_KEY`
4. Edit `wrangler.toml`:
   - set `SITE_URL` to your GitHub Pages URL
   - set `ALLOWED_ORIGIN` to the same GitHub Pages URL
5. Deploy:
   `wrangler deploy`

After deploy, your Worker endpoint will look like:

`https://mirror-gate-worker.<subdomain>.workers.dev/api/mirror-chat`

Health check:

`https://mirror-gate-worker.<subdomain>.workers.dev/health`

## Frontend config

Edit `js/runtime-config.js` and set:

```js
window.MirrorRuntimeConfig = {
  apiEndpoint: 'https://mirror-gate-worker.your-subdomain.workers.dev/api/mirror-chat',
  preferredModel: 'google/gemma-4-26b-a4b-it:free',
  fallbackModels: [
    'stepfun/step-3.5-flash:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
  ],
};
```

This file is safe to commit because it contains only the public Worker URL, not the OpenRouter key.

## Request shape

```json
{
  "mode": "next_question",
  "gateId": "forest_judgment",
  "conversation": [],
  "preferredModel": "google/gemma-4-26b-a4b-it:free",
  "fallbackModels": [
    "stepfun/step-3.5-flash:free",
    "nvidia/nemotron-3-super-120b-a12b:free"
  ]
}
```

If the Worker is unavailable or `apiEndpoint` is left blank, the frontend falls back to local scripted questions and heuristic scoring.
