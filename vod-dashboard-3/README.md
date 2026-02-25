# vod-dashboard-3

Migration Vue 3 (Vite) du dashboard VOD.

## Configuration environnement

Toute la configuration runtime est centralisée et exportée depuis:

- `src/config/env.ts`
  - `env`: configuration effective utilisée par l'app
  - `exportedConfiguration`: export complet de la configuration (safe pour debug)

### Variables `.env`

Voir `.env.example` (et `.env.development` fourni pour le local):

- `VITE_APP_PORT` (par défaut `8080`)
- `VITE_API_BASE_URL` (par défaut `/`)
- `VITE_API_PROXY_TARGET` (par défaut selon l'environnement détecté)
- `VITE_APIKEY`
- `VITE_WS_PATH`
- `VITE_SERVICE_HOST`
- `VITE_SERVICE_PORT`

## Local dev

Le serveur Vite est configuré sur le **port 8080** (`strictPort: true`).

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
- `/vod-ws`
- `/vodwonstatus`
- `/media`
- `/diva-monitoring`

La clé API (`apikey`) est injectée automatiquement côté proxy si `VITE_APIKEY` est défini.
