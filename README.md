<div align="center">

# Atlas — Air Quality Dashboard

### Individual deliverable · IA1

*Real-time air quality monitoring across five cities worldwide*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![React Admin](https://img.shields.io/badge/React_Admin-5-00ADB5?logo=react&logoColor=white)](https://marmelab.com/react-admin/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MUI](https://img.shields.io/badge/MUI-5-007FFF?logo=mui&logoColor=white)](https://mui.com)
[![License](https://img.shields.io/badge/usage-academic_project-22C55E)]()

</div>

---

## Table of Contents

- [Overview](#overview)
- [Dashboard Contents](#dashboard-contents)
- [Getting Started](#getting-started)
- [Production Build](#production-build)
- [Project Structure](#project-structure)
- [Data Pipeline](#data-pipeline)
- [Analysis Notebook](#analysis-notebook)
- [Tech Stack](#tech-stack)
- [Visual Identity](#visual-identity)

---

## Overview

**Atlas** is an individual dashboard (deliverable **IA1**) built with **React Admin**,
consuming the `source-data/air_quality_clean.csv` file produced by the group pipeline
**DONNEES2_High5**.

|                    |                                               |
|--------------------|-----------------------------------------------|
| **Cities covered** | Antananarivo, Nairobi, New York, Paris, Tokyo |
| **Data volume**    | ~11,350 hourly readings                       |
| **Period**         | April 26 → August 1, 2026                     |
| **Indicator**      | Official AQI index (1-5 scale) + 8 pollutants |

---

## Dashboard Contents

**Dashboard** *(home page)*
- Instrument-style gauges per station (color-coded on the official AQI 1–5 scale)
- Quick summary: the most/the least polluted city, weekly hourly peak
- Daily AQI trend, AQI category distribution
- 8-pollutant comparison by city
- Day x hour heatmap

**"Measures" resource**
- Filterable grid (city, AQI level, weekend) across ~11,350 rows of the fact table
- Per-reading detail view (pollutant breakdown)

**"Cities" resource**
- Per-station profile: gauge, city-specific trend, pollutant averages, NH3/CO data gaps

---

## Getting Started

No API key or database is required: the cleaned data was converted once into JSON
(`src/data/`) via `scripts/prep_data.py` and is served by a React Admin `dataProvider`
(`ra-data-fakerest`) that faithfully reproduces pagination, sorting, and filtering of a
real REST API, locally.

```bash
npm install
npm run dev       # http://localhost:5173
```

## Production Build

```bash
npm run build      # generates dist/
npm run preview    # serves the build on http://localhost:4173
```

---

## Project Structure

```
aqi-dashboard/
├── analysis/                   # Exploratory analysis notebook
│   └── Atlas_analyse_qualite_air.ipynb
├── scripts/
│   └── prep_data.py            # Source CSV -> JSON consumed by the app
├── source-data/
│   └── air_quality_clean.csv   # Cleaned data (group pipeline)
├── src/
│   ├── aqi/                    # AQI scale, city color palette
│   ├── components/             # Gauge, charts, station cards
│   ├── dashboard/               # Home page
│   ├── data/                    # Generated JSON (measures, cities, trends...)
│   ├── dataProvider/            # ra-data-fakerest provider
│   ├── layout/                  # AppBar, Layout
│   ├── resources/                # React Admin resources (cities, measures)
│   └── theme.js                  # MUI theme - Atlas visual identity
└── public/                       # Favicon, icons
```

---

## Data Pipeline

If the source CSV changes, regenerate the JSON files:

```bash
python3 scripts/prep_data.py
```

The script reads `source-data/air_quality_clean.csv` and regenerates `src/data/*.json`
(measures, cities, trends, heatmap, distribution, pollutant averages).

---

## Analysis Notebook

The exploratory data analysis (EDA) behind the dashboard is available in
`analysis/Atlas_analyse_qualite_air.ipynb` — per-city statistics, AQI category
distribution, time trend, weekly heatmap, pollutant comparison, and correlation
matrix, executed with its outputs already visible.

```bash
jupyter notebook analysis/Atlas_analyse_qualite_air.ipynb
```

---

## Tech Stack

| Role            | Technology                                                                            |
|-----------------|---------------------------------------------------------------------------------------|
| Admin framework | **React Admin** (v5) - resources, filterable lists, detail views, theming             |
| Data provider   | **ra-data-fakerest** - in-memory, no backend required for this individual deliverable |
| Charts          | **Recharts** - lines, bars                                                            |
| UI / Theme      | **MUI** - light Soft UI, palette derived from the official AQI scale                  |
| Build           | **Vite**                                                                              |
| Analysis        | **Python** (pandas, matplotlib) via Jupyter Notebook                                  |

---

## Visual Identity

**Soft UI Premium** style (light background, white cards, rounded corners, soft shadows)
with an environmental color palette:

`#22C55E` Emerald green - primary accent and good air quality
`#3B82F6` Sky blue - information, charts
`#8B5CF6` Soft violet - secondary elements
`#F97316` Coral - alerts / critical indicators

The five AQI severity colors (green → yellow → coral → red) remain the sole visual
language for data throughout the dashboard.

---

<div align="center">

*Project built as part of the DONNEES2 module — individual deliverable IA1*

</div>