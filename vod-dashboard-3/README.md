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


## Compléments fonctionnels migrés depuis Vue 2

Les éléments suivants ont été réimplémentés dans la version Vue 3 :

- **Menu contextuel Emissions** : actions de masse reliées au backend pour
  - demande d'export d'archives,
  - vérification avant traitement,
  - régénération des sous-titres,
  - changement de statut de traitement,
  - changement de délai de traitement.
- **Modals Emissions** :
  - ajout des options d'export (destination + forçage de retraitement),
  - ajout du tableau des offres dans la vérification avant traitement,
  - affichage de retours de statut action par action.
- **Synchronisation de date inter-écrans** :
  - la date sélectionnée est partagée entre Dashboard, Vod Manuel et Diva Monitoring.
  - la date est synchronisée dès modification des sélecteurs de date, même avant soumission de recherche.
- **Panel Transcodages (détails émission)** :
  - ajout des options de clic-droit manquantes,
  - ajout des actions backend (publier, contrôle avant publication, arrêt du transcodage),
  - modals de confirmation / réponse,
  - positionnement du menu contextuel au-dessus du curseur pour éviter qu'il soit tronqué en bas de page.
- **Vod Manuel** :
  - règles de boutons grisés selon la sélection,
  - activation conditionnelle de la réconciliation,
  - appels backend ajoutés pour la réconciliation et la découpe (avec/sans transcodage auto).

- **Header** : ajout d'une icône utilisateur devant le nom affiché en haut à droite.
