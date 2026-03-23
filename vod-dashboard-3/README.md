# vod-dashboard-3

Migration Vue 3 (Vite) du dashboard VOD.

## Local dev

Le serveur Vite est configuré sur le **port 8080** (`strictPort: true`).

node v25.8.0

```bash
npm install
npm run dev
```

## Proxy API (local)

Le `vite.config.ts` proxifie les principaux préfixes API legacy vers `VITE_API_PROXY_TARGET`:

- `/notification`
- `/sgt-listener`
- `/lava`
- `/restore`
- `/media`
- `/diva-monitoring`

