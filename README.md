# AquaLink OneHealth 🌊🩺
> **From Streams to Systems: Turning Citizen Science into Actionable One Health Intelligence**  
> *Official Prototype Submission for the IEEE OneAquaHealth Global Hackathon 2026*  
> **"Healthy Waters, Healthy Ecosystems, Healthy Communities"**

[![Backend CI / Pytest](https://img.shields.io/badge/pytest-27%20passed-emerald.svg)](./backend/tests)
[![Frontend Tests](https://img.shields.io/badge/frontend%20tests-5%20passed-teal.svg)](./frontend/src/tests)
[![Frontend Build](https://img.shields.io/badge/vite-compiled%200%20errors-teal.svg)](./frontend)
[![HL7 FHIR R4](https://img.shields.io/badge/HL7%20FHIR-R4%20Compliant-blue.svg)](./docs/fhir_implementation_guide.md)
[![OGC GeoJSON](https://img.shields.io/badge/OGC-GeoJSON%20CRS84-orange.svg)](./backend/app/services/ogc_converter.py)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Hackathon Track Alignment & Rubric Matrix

| Rubric Metric | Weight | AquaLink OneHealth Implementation & Operational Proof |
| :--- | :---: | :--- |
| **Impact & OneAquaHealth Alignment** | **30%** | Explicit mathematical bridge linking freshwater metrics (pH, DO, turbidity, benthic EPT macroinvertebrates) directly to **public health hazard vectors** (waterborne pathogens, *Culex* mosquito breeding in hypoxic pools, cyanobacterial HAB toxins, and contact advisories). Calibrated across official **EU Horizon OneAquaHealth pilot basins** (**Coimbra, Portugal**; **Benevento, Italy**; **Oslo, Norway**) and international benchmarks. |
| **Innovation & Creativity** | **20%** | **Multi-stage AI Verification Agent** providing real-time contradiction detection (e.g. flagging impossible Plecoptera stonefly reports in hypoxic waters, or "crystal clear" reports with high NTU) paired with explainable reasoning and vision annotation analysis. |
| **Technical Implementation** | **20%** | Production-ready full-stack monorepo: FastAPI backend, Pydantic schemas, 27 automated pytest tests, React 19 + TypeScript + Tailwind CSS frontend, and Docker Compose reproducibility. |
| **Usability & UX** | **15%** | Track 1 compliant citizen streamkeeper workflow: guided visual counters for bio-indicators, instant validation feedback, interactive geospatial risk map, and plain-language ecological translation. |
| **Feasibility & Scalability** | **15%** | Standards-compliant Track 7 backend: direct transformation into **HL7 FHIR R4 `Observation` and `RiskAssessment` resources** with standard LOINC codes (appealing to **HL7 Europe & EFMI**), alongside **OGC GeoJSON** for spatial sensor networks. |

---

## 2. System Architecture

```
                          ┌────────────────────────────────────────────────────────┐
                          │         AquaLink OneHealth Unified Platform            │
                          └────────────────────────────────────────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
    ┌──────────────────────────┐                                          ┌──────────────────────────┐
    │   Citizen Science UX     │                                          │  Regional Resilience Hub │
    │   (React + Vite + TW)    │                                          │  (EHR & Municipal Desk)  │
    └────────────┬─────────────┘                                          └─────────────▲────────────┘
                 │                                                                      │
                 │ POST /observations/validate (Instant feedback)                      │
                 │ POST /observations (Certified submission)                           │
                 ▼                                                                      │
    ┌───────────────────────────────────────────────────────────────────────────────────┼────────────┐
    │                               FASTAPI BACKEND ENGINE                              │            │
    ├───────────────────────────────────────────────────────────────────────────────────┴────────────┤
    │                                                                                                │
    │  1. AI Validation Pipeline                                                                     │
    │     ├── Physical DO Saturation Verification (Weiss 1970 polynomial)                            │
    │     ├── Sensor-Visual Concordance (Turbidity vs Clarity)                                       │
    │     └── Ecological Paradox Detection (Stonefly Hypoxia & Sewage vs EPT)                        │
    │                                                                                                │
    │  2. One Health Risk Assessment Engine                                                          │
    │     ├── Water Quality Index (NSF-WQI 0-100)                                                    │
    │     ├── Ecological Health Index (EHI: Bio-composite BMWP + Hilsenhoff FBI)                     │
    │     ├── Public Health Pathogen Risk (Coliform / Leptospira wash-off model)                     │
    │     ├── Vector-Borne Disease Hazard (Culex mosquito breeding & predator exclusion)             │
    │     └── Cyanobacterial HAB Risk (Phosphates, thermal acceleration, supersaturation)           │
    │                                                                                                │
    │  3. Digital Health & Interoperability Adapters (Track 7)                                       │
    │     ├── HL7 FHIR R4 Bundle Converter (LOINC 8040-0, 11558-4, 2710-2, 97561-5)                  │
    │     └── OGC GeoJSON FeatureCollection Exporter (CRS84)                                         │
    └────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Quickstart & Local Reproduction

### Option A: Automated Single-Command Docker Compose (Recommended)
```bash
docker compose up --build
```
- Frontend Dashboard: `http://localhost:3000`
- Backend Swagger API: `http://localhost:8000/docs`

---

### Option B: Local Development Run

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Run automated backend test suite (27 unit & integration tests):*
```bash
pytest -v
```

#### 2. Frontend Setup (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
*Run automated frontend test suite:*
```bash
npm test
```
Open `http://localhost:5173` in your browser.

---

## 4. REST API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status and loaded station count |
| `GET` | `/api/v1/streams` | List all stream observation records with optional catchment and advisory filters |
| `GET` | `/api/v1/streams/{id}` | Retrieve individual stream profile, readings, and One Health metrics |
| `POST` | `/api/v1/observations/validate` | Instant AI verification preview for client forms (contradiction detection) |
| `POST` | `/api/v1/observations` | Ingest official citizen observation, calculate One Health score, and archive |
| `GET` | `/api/v1/alerts` | Aggregate active municipal and public health early warning triggers |
| `GET` | `/api/v1/stats` | Watershed summary metrics (Mean One Health, WQI, EHI, EPT taxa, advisories) |
| `GET` | `/api/v1/fhir/observations/{id}` | Export single stream observation as HL7 FHIR R4 Bundle |
| `GET` | `/api/v1/fhir/bundle` | Export entire regional dataset as HL7 FHIR R4 Collection Bundle |
| `GET` | `/api/v1/ogc/geojson` | Export stream monitoring network as standard OGC GeoJSON FeatureCollection |

---

## 5. Technology Stack

- **Backend**: Python 3.9+, FastAPI, Pydantic v2, HTTPX, Pytest, Uvicorn.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet.
- **Interoperability Standards**: HL7 FHIR R4, Regenstrief LOINC, UCUM, OGC GeoJSON.
- **Ecological Indices**: NSF-WQI, BMWP (Biological Monitoring Working Party), Hilsenhoff FBI (Family Biotic Index), Benson & Krause (1984) / USGS DO saturation model.

---

## 6. Project Directory Layout

```
.
├── backend/
│   ├── app/
│   │   ├── api/routes.py            # REST API routes
│   │   ├── models/                  # Pydantic schemas (observation & onehealth)
│   │   ├── services/
│   │   │   ├── ai_validator.py      # AI contradiction & anomaly engine
│   │   │   ├── fhir_converter.py    # HL7 FHIR R4 transformation
│   │   │   ├── ogc_converter.py     # OGC GeoJSON exporter
│   │   │   ├── onehealth_risk.py    # Public health & vector hazard algorithms
│   │   │   ├── seed_data.py         # 12 diverse urban stream stations across EU & Global pilots
│   │   │   └── water_quality.py     # WQI, BMWP, FBI, and DO physics
│   │   ├── config.py
│   │   └── main.py
│   ├── tests/                       # 27 automated pytest test cases
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/              # Map, Form, Alerts, Analytics, Standards, Modals
│   │   ├── services/api.ts          # Backend API client
│   │   ├── types/index.ts           # Shared TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docs/
│   ├── onehealth_framework.md       # Full scientific & mathematical formulations
│   └── fhir_implementation_guide.md # LOINC & FHIR R4 specification
├── docker-compose.yml
├── README.md
├── SUBMISSION.md                    # Official Devpost submission copy
└── DEMO_SCRIPT.md                   # 3-to-5 minute video storyboard & script
```
