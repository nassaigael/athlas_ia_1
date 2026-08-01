<div align="center">

# Atlas — Qualité de l'Air

### Dashboard individuel · Livrable IA1

*Suivi de la qualité de l'air en temps réel sur 5 villes du monde*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![React Admin](https://img.shields.io/badge/React_Admin-5-00ADB5?logo=react&logoColor=white)](https://marmelab.com/react-admin/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MUI](https://img.shields.io/badge/MUI-5-007FFF?logo=mui&logoColor=white)](https://mui.com)
[![License](https://img.shields.io/badge/usage-projet_académique-22C55E)]()

</div>

---

## Sommaire

- [Aperçu](#-aperçu)
- [Contenu du dashboard](#-contenu-du-dashboard)
- [Démarrage rapide](#-démarrage-rapide)
- [Build de production](#-build-de-production)
- [Structure du projet](#-structure-du-projet)
- [Pipeline de données](#-pipeline-de-données)
- [Notebook d'analyse](#-notebook-danalyse)
- [Stack technique](#-stack-technique)
- [Identité visuelle](#-identité-visuelle)

---

## Aperçu

**Atlas** est un dashboard individuel (livrable **IA1**) construit avec **React Admin**,
consommant le fichier `source-data/air_quality_clean.csv` produit par le pipeline de
groupe **DONNEES2_High5**.

|                          |                                                   |
|--------------------------|---------------------------------------------------|
| 🏙️ **Villes couvertes** | Antananarivo · Nairobi · New York · Paris · Tokyo |
| 📊 **Volume de données** | ~11 350 relevés horaires                          |
| 📅 **Période**           | 26 avril → 1ᵉʳ août 2026                          |
| 🌫️ **Indicateur**       | Indice AQI officiel (échelle 1 à 5) + 8 polluants |

---

## 📊 Contenu du dashboard

**Tableau de bord** *(page d'accueil)*

- Jauges style instrument par station (couleur = échelle AQI officielle 1-5)
- Lecture rapide : ville la plus/moins polluée, pic horaire hebdomadaire
- Tendance quotidienne de l'AQI, répartition des catégories AQI
- Comparatif des 8 polluants par ville
- Heatmap jour × heure

**Ressource « Relevés »**

- Grille filtrable (ville, niveau AQI, week-end) sur les ~11 350 lignes de la table de faits
- Fiche détail par relevé (répartition des polluants)

**Ressource « Villes »**

- Fiche par station : jauge, tendance propre à la ville, moyennes des polluants, trous de données NH₃/CO

---

## 🚀 Démarrage rapide

Aucune clé API ni base de données n'est nécessaire : les données nettoyées ont été
converties une fois en JSON (`src/data/`) via `scripts/prep_data.py` et sont servies
par un `dataProvider` React Admin (`ra-data-fakerest`) qui reproduit fidèlement
pagination, tri et filtres d'une vraie API REST, en local.

```bash
npm install
npm run dev       # http://localhost:5173
```

## 📦 Build de production

```bash
npm run build      # génère dist/
npm run preview    # sert le build sur http://localhost:4173
```

---

## 🗂️ Structure du projet

```
aqi-dashboard/
├── analysis/                   # Notebook Jupyter d'analyse exploratoire
│   └── Atlas_analyse_qualite_air.ipynb
├── scripts/
│   └── prep_data.py            # CSV source → JSON consommés par l'app
├── source-data/
│   └── air_quality_clean.csv   # Données nettoyées (pipeline de groupe)
├── src/
│   ├── aqi/                    # Échelle AQI, palette des villes
│   ├── components/             # Jauge, graphiques, cartes station
│   ├── dashboard/               # Page d'accueil
│   ├── data/                    # JSON générés (mesures, villes, tendances…)
│   ├── dataProvider/            # Provider ra-data-fakerest
│   ├── layout/                  # AppBar, Layout
│   ├── resources/                # Ressources React Admin (villes, relevés)
│   └── theme.js                  # Thème MUI — charte graphique Atlas
└── public/                       # Favicon, icônes
```

---

## 🔄 Pipeline de données

Si le CSV source change, régénère les fichiers JSON :

```bash
python3 scripts/prep_data.py
```

Le script lit `source-data/air_quality_clean.csv` et régénère `src/data/*.json`
(mesures, villes, tendances, heatmap, distribution, moyennes polluants).

---

## 🧪 Notebook d'analyse

L'analyse exploratoire (EDA) ayant guidé la construction du dashboard est disponible
dans `analysis/Atlas_analyse_qualite_air.ipynb` — statistiques par ville, distribution
des catégories AQI, tendance temporelle, heatmap hebdomadaire, comparaison des
polluants et matrice de corrélation, exécuté avec ses résultats déjà visibles.

```bash
jupyter notebook analysis/Atlas_analyse_qualite_air.ipynb
```

---

## 🛠️ Stack technique

| Rôle            | Technologie                                                                         |
|-----------------|-------------------------------------------------------------------------------------|
| Framework admin | **React Admin** (v5) — ressources, listes filtrables, vues détail, thème            |
| Data provider   | **ra-data-fakerest** — en mémoire, aucun backend requis pour ce livrable individuel |
| Graphiques      | **Recharts** — lignes, barres                                                       |
| UI / Thème      | **MUI** — Soft UI clair, palette dérivée de l'échelle AQI officielle                |
| Build           | **Vite**                                                                            |
| Analyse         | **Python** (pandas, matplotlib) via Jupyter Notebook                                |

---

## 🎨 Identité visuelle

Charte **Soft UI Premium** (fond clair, cartes blanches, coins arrondis, ombres douces)
avec une palette environnementale :

`#22C55E` Vert émeraude — accent principal & bonne qualité de l'air
`#3B82F6` Bleu ciel — informations, graphiques
`#8B5CF6` Violet doux — éléments secondaires
`#F97316` Corail — alertes / indicateurs critiques

Les 5 couleurs de sévérité AQI (vert → jaune → corail → rouge) restent l'unique
langage visuel des données à travers tout le dashboard.

---

<div align="center">

*Projet réalisé dans le cadre du module DONNEES2 — livrable individuel IA1*

</div>