# Atlas Qualité de l'Air — Dashboard IA1

Dashboard individuel (livrable **IA1**) construit avec **React Admin**, consommant le
fichier `clean/air_quality_clean.csv` produit par le pipeline de groupe **DONNEES2_High5**
(5 villes : Antananarivo, Nairobi, New York, Paris, Tokyo — ~11 350 relevés horaires,
26 avril → 1er août 2026).

## Lancer le projet

```bash
npm install
npm run dev       # http://localhost:5173
```

Build de production :

```bash
npm run build      # génère dist/
npm run preview    # sert le build sur http://localhost:4173
```

Aucune clé API ni base de données n'est nécessaire : les données nettoyées ont été
converties une fois en JSON (`src/data/`) via `scripts/prep_data.py` et sont servies par
un `dataProvider` React Admin (`ra-data-fakerest`) qui reproduit fidèlement pagination,
tri et filtres d'une vraie API REST, en local.

## Contenu du dashboard

- **Tableau de bord** (page d'accueil) : jauges style instrument par station (couleur =
  échelle AQI officielle 1‑5), lecture rapide (ville la plus/moins polluée, pic horaire
  hebdomadaire), tendance quotidienne, répartition des catégories AQI, comparatif des
  8 polluants par ville, heatmap jour × heure.
- **Ressource "Relevés"** : grille filtrable (ville, niveau AQI, week-end) sur les
  ~11 350 lignes de la table de faits, avec fiche détail par relevé (répartition des
  polluants).
- **Ressource "Villes"** : fiche par station (jauge, tendance propre à la ville,
  moyennes polluants, trous de données NH₃/CO).

## Régénérer les données

Si le CSV source change, relancer :

```bash
python3 scripts/prep_data.py
```

Le script lit `source-data/air_quality_clean.csv` et régénère `src/data/*.json`
(mesures, villes, tendances, heatmap, distribution, moyennes polluants).

## Stack

- **React Admin** (v5) — structure d'administration : ressources, listes filtrables,
  vues détail, thème.
- **ra-data-fakerest** — dataProvider en mémoire (aucun backend requis pour ce livrable
  individuel).
- **Recharts** — graphiques (lignes, barres).
- **MUI** — composants et thème (sombre, palette dérivée de l'échelle AQI officielle).
