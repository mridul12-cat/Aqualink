# AquaLink OneHealth

### From citizen observations to actionable One Health intelligence

AquaLink helps communities monitor urban streams by turning citizen observations into validated ecosystem-health signals, public-health risk indicators, and actionable alerts.

```
Citizen observation
        ↓
    Validation
        ↓
One Health assessment
        ↓
Actionable insight
        ↓
FHIR / GeoJSON interoperability
```

[![Backend CI / Pytest](https://img.shields.io/badge/pytest-41%20passed-emerald.svg)](./backend/tests)
[![Frontend Tests](https://img.shields.io/badge/frontend%20tests-11%20passed-teal.svg)](./frontend/src/tests)
[![Frontend Build](https://img.shields.io/badge/vite-compiled%200%20errors-teal.svg)](./frontend)
[![HL7 FHIR R4](https://img.shields.io/badge/HL7%20FHIR-R4%20Compliant-blue.svg)](./docs/fhir_implementation_guide.md)
[![OGC GeoJSON](https://img.shields.io/badge/OGC-GeoJSON%20CRS84-orange.svg)](./backend/app/services/ogc_converter.py)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## The problem

Urban waterways are the frontlines of both environmental resilience and community health. Yet today:

1. **Citizen observations expand monitoring capacity, but face credibility hurdles**: Volunteer streamkeepers can cover miles of streams that municipal staff cannot reach, but raw field observations may contain sensor calibration drift, observational mistakes, or organism misidentifications that regulatory bodies hesitate to accept.
2. **Observations may contain inconsistencies**: A volunteer might log "crystal clear" water while probe turbidity is sky-high, or mistake a pollution-tolerant midge larva for a sensitive stonefly nymph in stagnant, deoxygenated water.
3. **Raw environmental measurements are difficult to interpret**: Reporting "DO: 3.2 mg/L" or "turbidity: 55 NTU" does not tell a community resident whether it is safe to walk their dog, or tell a city official whether mosquitoes are breeding.
4. **Ecosystem and health information are disconnected**: Hydrology data sits in municipal environmental spreadsheets, completely siloed from digital health standards, epidemiology registries, and public health warning systems.

---

## What AquaLink does

AquaLink bridges the entire continuum from stream bank to health system:

```
Citizen
   → observation
   → validation
   → One Health assessment
   → risk/action
   → interoperable data
```

| Capability | What it does | Hackathon alignment |
| :--- | :--- | :--- |
| **Citizen Observation Wizard** | Guided, jargon-free field entry for in-situ probe readings, macroinvertebrate counts, and sensory conditions with real-time feedback. | Track 1 — Citizen Science UX |
| **Validation Engine** | Explainable AI-assisted validation using scientific rules, anomaly detection, and human-in-the-loop review. | Track 3 — AI-Supported Assessment |
| **One Health Risk Engine** | Algorithmic synthesis linking ecosystem metrics (WQI, EHI, BMWP) to public health hazards (pathogen indicators, vector hazards, HABs). | Track 2 — Data-to-Insight |
| **Regional Risk Map** | Geospatial map spanning international pilot river basins (Coimbra, Benevento, Oslo, Portland) with color-coded risk pins and alert beacons. | Track 2 / Track 6 |
| **Resilience Dashboard** | Early warning triage desk translating environmental alerts into concrete municipal interventions (aeration, signage, larvicide). | Track 6 — Resilience Informatics |
| **FHIR + GeoJSON Export** | Dynamic transformation into HL7 FHIR R4 Observation & RiskAssessment resources with LOINC coding, alongside OGC GeoJSON. | Track 7 — Digital Health Standards |

---

## The 60-second example

To see AquaLink in action, consider a citizen monitoring an urban reach following morning storm runoff:

### 1. Receives the observation
The volunteer submits field readings:
- Dissolved Oxygen: **3.2 mg/L** (hypoxic)
- Turbidity: **68 NTU** (turbid)
- Visual Clarity reported: *"Crystal clear"*
- Water Odor: *"Sewage / sulfur"*
- Biological survey: **6 stonefly nymphs**, **8 mayfly nymphs**, **25 tubifex worms**

### 2. Identifies contradictions and anomalies
AquaLink's validation engine immediately detects multiple scientific contradictions:
- **Sensor ↔ Visual Contradiction (`RULE_VIS_01`)**: Field report claims *"crystal clear"* water, but sensor turbidity is 68 NTU.
- **Ecological Paradox (`RULE_BIO_01`)**: 6 *Plecoptera* (stonefly nymphs) reported in critically hypoxic water (DO 3.2 mg/L). Stoneflies have delicate branchial gills and physically suffocate in prolonged DO below 5.0 mg/L.
- **Sanitary Contradiction (`RULE_BIO_02`)**: Heavy sewage/sulfur odor logged alongside pollution-sensitive EPT nymphs.

### 3. Explains why they matter
AquaLink does not present a black-box error. It provides an explainable scientific rationale:
- The photometer vial may be smudged or stream substrate reflection was misjudged.
- The volunteer likely misidentified damselfly nymphs or midge larvae as stoneflies, or natural sulfur marsh gas was present.

### 4. Requests human review when necessary
The system does **not** discard the volunteer's report. Instead:
- Validation confidence is adjusted to **45.0%** (*"Confidence reflects agreement with prototype validation rules; it does not represent scientific certainty"*).
- Status is flagged as `FLAG_CONTRADICTION` with **HUMAN REVIEW REQUIRED**.
- Catchment officers receive the flagged observation with specific guided verification suggestions.

### 5. Feeds validated information into One Health assessment
Once verified or corrected for the reach:
- **Waterborne Pathogen Risk Indicator**: Scored at **78/100 (CRITICAL)** due to high turbidity wash-off, sewage odor, and tubifex dominance (*model-derived indicator; laboratory confirmation required*).
- **Disease Vector Hazard**: Scored at **75/100 (CRITICAL)** because severe hypoxia has eliminated predatory fish while warm water accelerates *Culex* mosquito larvae.
- **Recreational Contact Advisory**: **UNSAFE**.

### 6. Produces an actionable risk view
- **Regional Map**: Pin turns RED with an active early warning beacon.
- **Resilience Panel**: Issues municipal directive: *"PUBLIC HEALTH ALERT: Post contact prohibition signs along reach; dispatch catchment team for sanitary sewer overflow tracing."*
- **Standards Export**: Instantly exports an HL7 FHIR R4 Bundle with LOINC `2710-2` (DO), `97561-5` (Turbidity), and FHIR `RiskAssessment` resources for digital health registry interoperability.

---

## Why this matters

AquaLink explicitly connects all dimensions of the One Health paradigm:

```
    Ecosystem Health ──────► Animal & Vector Health ──────► Human & Community Health
   (DO, pH, WQI, BMWP)     (Fish predation, mosquitoes)   (Recreation, pathogens, alerts)
            │                           │                                │
            └───────────────────────────┼────────────────────────────────┘
                                        ▼
                           Actionable Decision Support
```

- **Ecosystem Health**: Tracks water chemistry and benthic macroinvertebrates (mayflies, stoneflies, caddisflies) using standard Biological Monitoring Working Party (BMWP) and Hilsenhoff Family Biotic Index (FBI) formulations.
- **Animal & Environmental Vectors**: Analyzes ecological cascades—e.g. how stream hypoxia (<3.5 mg/L DO) causes mortality in predatory fish (*Gambusia*, juvenile trout), allowing air-breathing *Culex* mosquito larvae to thrive unhindered.
- **Human & Community Health**: Translates raw environmental conditions into actionable public health risk indicators (waterborne pathogen risks, cyanobacterial toxic bloom risks, recreational contact advisories).
- **Decision Support**: Delivers clear, plain-language directives to citizens and municipal responders (sign posting, culvert clearing, microbial testing).

---

## Technical architecture

### High-level conceptual flow

```
CITIZEN
  ↓
STREAM OBSERVATION
  ↓
VALIDATION
  ├── Physics (DO Solubility)
  ├── Sensor ↔ Visual (Turbidity vs Clarity)
  └── Ecology (Macroinvertebrate Paradoxes)
  ↓
VERIFIED / HUMAN REVIEW
  ↓
ONE HEALTH RISK ENGINE
  ├── Water Quality Index (NSF-WQI)
  ├── Ecological Health Index (EHI)
  └── Public Health Hazards (Pathogens, Vectors, HABs)
  ↓
MAP + ALERTS + ACTION
  ↓
FHIR R4 / GeoJSON (Digital Health Interoperability)
```

### Detailed component architecture

```
                          ┌────────────────────────────────────────────────────────┐
                          │         AquaLink OneHealth Unified Platform            │
                          └────────────────────────────────────────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
    ┌──────────────────────────┐                                          ┌──────────────────────────┐
    │   Citizen Science UX     │                                          │  Regional Resilience Hub │
    │   (React 19 + TypeScript)│                                          │  (Municipal Incident Desk│
    └────────────┬─────────────┘                                          └─────────────▲────────────┘
                 │                                                                      │
                 │ POST /observations/validate (Instant feedback)                      │
                 │ POST /observations (Validated submission)                           │
                 ▼                                                                      │
    ┌───────────────────────────────────────────────────────────────────────────────────┼────────────┐
    │                               FASTAPI BACKEND ENGINE                              │            │
    ├───────────────────────────────────────────────────────────────────────────────────┴────────────┤
    │                                                                                                │
    │  1. AI-Assisted Validation Pipeline (ai_validator.py)                                          │
    │     ├── Physical DO Saturation Verification (Benson & Krause 1984 / Weiss 1970 polynomial)     │
    │     ├── Sensor-Visual Concordance (Turbidity NTU vs Visual Clarity)                            │
    │     ├── Ecological Paradox Detection (Stonefly/Mayfly Hypoxia & Sewage vs EPT)                 │
    │     └── Human-in-the-Loop Flagging (observations flagged for review, never silently dropped)   │
    │                                                                                                │
    │  2. One Health Risk Assessment Engine (onehealth_risk.py & water_quality.py)                  │
    │     ├── Water Quality Index (Modified NSF-WQI 0-100)                                           │
    │     ├── Ecological Health Index (EHI: Bio-composite BMWP + Hilsenhoff FBI)                     │
    │     ├── Waterborne Pathogen Risk Indicator (Model-derived runoff & sewage surrogate)           │
    │     ├── Vector-Borne Disease Hazard (Culex mosquito breeding & predator exclusion)             │
    │     └── Cyanobacterial HAB Risk (Phosphates, thermal acceleration, supersaturation)           │
    │                                                                                                │
    │  3. Digital Health Standards Adapters (fhir_converter.py & ogc_converter.py)                  │
    │     ├── HL7 FHIR R4 Bundle Converter (LOINC 8040-0, 11558-4, 2710-2, 97561-5, 14860-1, etc.)   │
    │     └── OGC GeoJSON FeatureCollection Exporter (CRS84 compliant)                               │
    └────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology

- **Backend**: Python 3.9+, FastAPI, Pydantic v2, Pytest (41 automated tests).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet (11 automated tests).
- **Standards & Vocabularies**: HL7 FHIR R4, Regenstrief LOINC, UCUM units of measure, OGC GeoJSON.
- **Scientific Formulations**: USGS Benson & Krause (1984) DO saturation kinetics, NSF-WQI curves, BMWP (Biological Monitoring Working Party), Hilsenhoff Family Biotic Index (FBI).
- **Containerization**: Multi-stage Dockerfiles and root `docker-compose.yml`.

---

## Validation approach

AquaLink provides **Explainable AI-assisted validation using scientific rules, anomaly detection, and human-in-the-loop review**.

```
Citizen input
      ↓
Physical plausibility checks
      ↓
Sensor ↔ visual consistency
      ↓
Ecological consistency
      ↓
Anomaly detection
      ↓
Human review when required
```

Key principles of the validation engine:
1. **Explainability over Black Boxes**: The validator evaluates grounded physical laws and verified ecological guild tolerances rather than opaque probabilistic guesses.
2. **Scientific Plausibility**: Compares probe readings against standard freshwater temperature-solubility curves.
3. **Multi-source Consistency**: Cross-checks sensor photometer readings against human visual observations and biological specimen counts.
4. **Human-in-the-Loop Preservation**: **The system does not automatically decide that a citizen is wrong.** It identifies observations that require verification, drops confidence, and flags them for catchment officer review rather than silently rejecting volunteer data.
5. **No False Claims**: The system does not claim autonomous scientific certification or laboratory confirmation. Numerical confidence scores reflect agreement with prototype validation rules.

---

## Distinguishing Observed vs Inferred vs Recommended

To maintain rigorous scientific clarity, AquaLink strictly separates data layers throughout the application:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [OBSERVED] Field Measurements & Citizen Reports                                        │
│  - Water temperature (°C), pH, Dissolved Oxygen (mg/L), Turbidity (NTU), Conductivity   │
│  - Benthic macroinvertebrate counts (stoneflies, mayflies, caddisflies, tubifex, etc.) │
│  - Sensory observations (clarity, odor, flow rate, surface sheen, trash, photo note)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [INFERRED] Model-Derived Indicators & Ecological Indices                               │
│  - Water Quality Index (WQI) and Ecological Health Index (EHI)                         │
│  - BMWP Bio-Class and Hilsenhoff FBI organic pollution interpretation                 │
│  - Waterborne Pathogen Risk Indicator (model-derived; laboratory confirmation required)│
│  - Vector-Borne Hazard Score (Culex mosquito breeding & predator exclusion)            │
│  - Cyanobacterial Harmful Algal Bloom (HAB) Risk Score                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [RECOMMENDED ACTION] Decision Support & Stewardship Directives                         │
│  - Public recreational contact advisories (Safe, Caution, Unsafe)                      │
│  - Municipal intervention protocols (signage, culvert clearance, dye testing, Bti)     │
│  - Citizen science monitoring intervals and buffer zone protection                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Reproducibility & Quickstart

### Automated Single-Command Docker Compose (Recommended)
```bash
docker compose up --build
```
- Frontend Dashboard: `http://localhost:3000`
- Backend API Docs (Swagger UI): `http://localhost:8000/docs`

---

### Local Development Setup

#### 1. Backend Service (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Run automated backend tests:*
```bash
pytest -v
```
*(41 automated test cases verifying validation rules, risk engines, FHIR conversions, boundary coordinates, missing optional fields, and endpoints)*

#### 2. Frontend Application (React + Vite + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
*Run automated frontend tests & production build:*
```bash
npm test
npm run build
```
*(11 automated unit tests verifying schema conformance, scenario resets, decision hierarchy status logic, basin coordinates, and filtering)*

Open `http://localhost:5173` in your browser.

---

## REST API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status and loaded station count |
| `GET` | `/api/v1/streams` | List stream observation records with optional `pilot_city`, `catchment`, and `advisory` filters |
| `GET` | `/api/v1/streams/{id}` | Retrieve individual stream profile, readings, validation result, and One Health metrics |
| `POST` | `/api/v1/observations/validate` | Instant AI verification preview for client forms (contradiction detection & rationale) |
| `POST` | `/api/v1/observations` | Ingest citizen observation, run validation, compute One Health assessment, and store |
| `GET` | `/api/v1/alerts` | Aggregate active early warning directives across the basin (supports `?pilot_city=`) |
| `GET` | `/api/v1/stats` | Basin summary statistics (mean One Health, WQI, EHI, EPT count, advisories) |
| `GET` | `/api/v1/fhir/observations/{id}` | Export single stream observation as HL7 FHIR R4 Bundle with LOINC codes |
| `GET` | `/api/v1/fhir/bundle` | Export basin observations as combined HL7 FHIR R4 Collection Bundle |
| `GET` | `/api/v1/ogc/geojson` | Export stream monitoring stations as OGC GeoJSON FeatureCollection (CRS84) |

---

## Hackathon track alignment

### Primary Track
- **Track 3 — AI-Supported Assessment**: Explainable AI-assisted validation using scientific rules, anomaly detection, and human-in-the-loop review. Detects sensor-visual conflicts, DO gas solubility violations, and ecological paradoxes (e.g. stoneflies in hypoxia) with transparent rationales and verification triggers.

### Secondary Track
- **Track 7 — Digital Health Standards**: Dynamic transformation of validated citizen science observations into **HL7 FHIR R4 `Observation` and `RiskAssessment` resources** with official **LOINC** terminology, enabling **FHIR-based interoperability with compatible systems** (including clinical registries and HL7 Europe systems), accompanied by **OGC GeoJSON** for spatial sensor networks.

### Supporting Tracks
- **Track 1 — Citizen Science UX**: Intuitive, guided observation wizard with visual macroinvertebrate counters, sensory dropdowns, and instant debounced validation feedback.
- **Track 2 — Data-to-Insight**: Mathematical translation of raw chemical and biological data into plain-language summaries, comparative basin rankings, and macroinvertebrate guild spectrums.
- **Track 6 — Resilience Informatics**: Automated Early Warning & Resilience Center translating ecological indicators into municipal incident directives (contact prohibition, larvicide dispatch, buffer restoration).

---

## International River Basin Pilots

AquaLink OneHealth is seeded with 30 diverse urban stream stations across official OneAquaHealth international river basin pilot locations:

1. **Coimbra, Portugal (Mondego River Basin / Ribeira de Coselhas)** [Primary EU Pilot]: 6 stations spanning pristine limestone headwaters (Alto dos Gaios), urban linear park reaches, recreational riverfronts (Parque Verde), and post-rain industrial culverts.
2. **Benevento, Italy (Calore River / Sabato River Basin)** [EU Pilot]: 6 stations including historic urban bridges (Ponte Vanvitelli), stagnant river confluences with high mosquito vector potential, riparian nature parks, and agricultural floodplains.
3. **Oslo, Norway (Akerselva / Alna River Basin)** [EU Pilot]: 6 stations featuring sub-boreal cold drinking water outflows (Maridalsvannet), urban salmon spawning parks (Nydalen), recreational river falls (Grünerløkka), and daylighted post-industrial reaches (Kværnerbyen).
4. **Portland, USA (Columbia Slough / Lower Willamette Basin)** [US Case Study]: 12 urban reference streams encompassing restored wetland channels, forested canyons (Balch Creek), and stormwater-stressed urban sloughs.
