# API live — connexion à la vraie base High5 (Neon Postgres)

Ce petit serveur Express interroge directement le warehouse Postgres du pipeline
DONNEE2_High5 (tables `dim_city`, `dim_time`, `fact_air_quality`) et expose des
endpoints REST compatibles avec `ra-data-simple-rest`, consommés par le
dashboard React-Admin.

Il **doit** tourner côté serveur : les identifiants Postgres ne doivent jamais
être exposés dans le navigateur.

## 1. Installer les dépendances

```bash
cd server
npm install
```

## 2. Configurer les identifiants de la base

```bash
cp .env .env
```

Remplis `.env` avec les **vraies** valeurs récupérées dans les GitHub
Secrets/Variables du dépôt `DONNEE2_High5` (`DB_HOST`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD`). Je n'ai pas accès à ces secrets — c'est la seule étape que tu
dois faire toi-même.

## 3. Lancer l'API

```bash
npm start
# ou npm run dev pour le rechargement automatique
```

Vérifie que la connexion fonctionne :

```bash
curl http://localhost:4000/health
# {"status":"ok","db":"connected"}
```

## 4. Brancher le dashboard React-Admin dessus

À la racine du projet (pas dans `server/`) :

```bash
cp .env .env   # VITE_API_URL=http://localhost:4000
npm install             # installe ra-data-simple-rest
npm run dev
```

Sans `VITE_API_URL`, l'app retombe automatiquement sur le snapshot JSON
statique (`src/data/*.json`) — donc rien ne casse si tu n'as pas encore
configuré le serveur.

## Endpoints exposés

- `GET /cities` — une ligne par ville, agrégée à la volée depuis
  `fact_air_quality` (nb de mesures, AQI moyen, moyennes par polluant, dernière
  mesure, etc.)
- `GET /cities/:id`
- `GET /measures` — chaque relevé horaire, avec tri/filtre/pagination
  (`?range=`, `?sort=`, `?filter=`) au format attendu par React-Admin
- `GET /measures/:id`
- `GET /health`
