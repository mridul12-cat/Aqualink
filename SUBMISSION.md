# AquaLink OneHealth
> **IEEE OneAquaHealth Global Hackathon 2026 Submission**

---

## Tagline
**Turning citizen stream observations into validated, actionable One Health intelligence.**

---

## Track Alignment

| Track | Role | Relevance & Implementation in AquaLink |
| :--- | :---: | :--- |
| **Track 3: AI-Supported Assessment** | **Primary** | Explainable AI-assisted validation using scientific rules, anomaly detection, and human-in-the-loop review. Evaluates physical-chemical gas solubility laws, sensor-visual concordance, and benthic ecological guild consistency with transparent confidence scoring. |
| **Track 7: Digital Health Standards & Interoperability** | **Secondary** | Native serialization of environmental observations into **HL7 FHIR R4 Bundles** with standard **LOINC** terminology and **FHIR RiskAssessment** resources, paired with **OGC GeoJSON** for spatial sensor networks. Directly addresses the interoperability mission of **HL7 Europe** and **EFMI**. |
| **Track 1: Citizen Science UX** | Supporting | Step-by-step field submission wizard with live validation feedback, macroinvertebrate counters, and an interactive "How Validation Works" explainer modal. |
| **Track 2: Data-to-Insight** | Supporting | Regional stream map synthesizing raw sensor readings into composite Water Quality (WQI), Ecological Health (EHI), and One Health Harmony scores. |
| **Track 6: Resilience Informatics** | Supporting | Early warning municipal resilience dashboard translating inferred environmental risks into prioritized triage directives and simulated field dispatches. |

---

## 1. Problem Statement (~100 words)
Urban streams are vital ecological corridors and early sentinels of environmental deterioration. However, conventional stream monitoring remains severely fragmented:
1. **Unvalidated Citizen Data**: Community volunteers provide invaluable spatial coverage, but their data is routinely dismissed by regulatory and health authorities due to calibration drift, misidentification, and lack of systematic quality verification.
2. **Siloed Public Health Systems**: Environmental agencies log water parameters in disconnected spreadsheets, while epidemiologists only detect waterborne illness or vector-borne outbreaks weeks later when patients present at clinics.
3. **Absence of Actionable Interpretation**: Raw metrics like "turbidity 45 NTU" or "dissolved oxygen 3.2 mg/L" mean little to community members and municipal managers without actionable translation.

---

## 2. Proposed Solution (~150 words)
**AquaLink** creates an open-source bridge connecting community stream monitoring with One Health surveillance through a 5-stage pipeline:
1. **Citizen Field Capture**: Volunteers record physical probe readings, benthic macroinvertebrate tallies, and sensory stream conditions through a guided wizard.
2. **AI-Assisted Validation Engine**: Explainable AI-assisted validation using scientific rules, anomaly detection, and human-in-the-loop review. Evaluates physical solubility laws, sensor-visual concordance, and ecological guild tolerances in real time, assigning transparent confidence scores and flagging anomalies for human review.
3. **One Health Risk Synthesis**: Validated observations feed algorithmic risk models deriving Water Quality Index (NSF-WQI), Ecological Health (BMWP & Hilsenhoff FBI), model-derived waterborne pathogen risk indicators, and mosquito vector proliferation hazards.
4. **Resilience & Early Warning Dashboard**: Regional maps and triage panels translate multi-station risks into prioritized municipal directives (e.g., larviciding, sewer outfall tracing, contact advisories).
5. **Standardized Interoperability**: Every observation is serialized as an HL7 FHIR R4 bundle with LOINC codes and OGC GeoJSON for health surveillance and GIS platforms.

---

## 3. What We Built

| Feature / Capability | Component / Code Location | Stakeholder & Impact |
| :--- | :--- | :--- |
| **AI-Assisted Validation Engine** | [`backend/app/services/ai_validator.py`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/backend/app/services/ai_validator.py) | **Volunteers & Analysts**: Explainable AI-assisted validation using scientific rules, anomaly detection, and human-in-the-loop review. |
| **Interactive Validation Explainer Modal** | [`frontend/src/components/ValidationExplainerModal.tsx`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/frontend/src/components/ValidationExplainerModal.tsx) | **Judges & Citizens**: Demystifies validation rules with interactive scientific explanations. |
| **Citizen Field Submission Wizard** | [`frontend/src/components/ObservationForm.tsx`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/frontend/src/components/ObservationForm.tsx) | **Volunteers**: 4-step guided workflow with one-click bug counters and preset test scenarios. |
| **One Health Risk & Bio-Index Engine** | [`backend/app/services/water_quality.py`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/backend/app/services/water_quality.py), [`backend/app/services/onehealth_risk.py`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/backend/app/services/onehealth_risk.py) | **Ecologists & Epidemiologists**: Benson & Krause DO saturation, NSF-WQI, BMWP, Hilsenhoff FBI, and vector models. |
| **Regional Geospatial Risk Map** | [`frontend/src/components/StreamMap.tsx`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/frontend/src/components/StreamMap.tsx) | **Community & Municipalities**: Multi-basin Leaflet map covering 30 stations across 4 pilot basins (Coimbra, Benevento, Oslo, Portland). |
| **Stream Detail Profile & Provenance Modal** | [`frontend/src/components/StreamDetailModal.tsx`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/frontend/src/components/StreamDetailModal.tsx) | **Public Health Officers**: Clear semantic separation of `[OBSERVED]`, `[INFERRED]`, and `[RECOMMENDED ACTION]` data. |
| **Early Warning Resilience Center** | [`frontend/src/components/EarlyWarningPanel.tsx`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/frontend/src/components/EarlyWarningPanel.tsx) | **Emergency Managers**: Catchment hazard counters, prioritized triage alerts, and simulated municipal field dispatch. |
| **HL7 FHIR R4 & OGC GeoJSON Exporter** | [`backend/app/services/fhir_converter.py`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/backend/app/services/fhir_converter.py), [`backend/app/services/ogc_converter.py`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/backend/app/services/ogc_converter.py), [`frontend/src/components/InteropModal.tsx`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/frontend/src/components/InteropModal.tsx) | **Health Informatics (HL7 EU / EFMI)**: LOINC-coded FHIR R4 Bundles (`8040-0`, `11558-4`, `2710-2`, etc.) and OGC CRS84 GeoJSON. |
| **Catchment Biodiversity Analytics** | [`frontend/src/components/AnalyticsPanel.tsx`](file:///Users/mriduldabral/Downloads/Anti%20Gravity/Hackathon/frontend/src/components/AnalyticsPanel.tsx) | **Environmental Agencies**: Basin-wide EPT richness, FBI pollution tolerance distribution, and correlation charts. |

---

## 4. How the AI-Assisted Validation Works

Rather than employing an unverified or opaque black-box machine learning model, AquaLink provides **Explainable AI-assisted validation using scientific rules, anomaly detection, and human-in-the-loop review**, grounded in published freshwater limnology and sensor physics.

### The 4 Core Validation Rules
1. **Physical-Chemical Solubility Limits**: Calculates theoretical freshwater dissolved oxygen saturation at measured water temperatures using the USGS Benson & Krause (1984) polynomial. Flags uncalibrated sensors reporting $>140\%$ saturation without hyper-eutrophic conditions or $<1.0\text{ mg/L}$ in cold, turbulent headwaters.
2. **Sensor-Visual Concordance**: Evaluates agreement between optical turbidimeters and citizen visual clarity reports. If a user enters "crystal clear" water alongside a photometer reading of $>50\text{ NTU}$ (or "opaque/turbid" alongside $<5\text{ NTU}$), the system flags an instrument-visual discrepancy.
3. **Ecological Guild Consistency**: Assesses biological plausibility by cross-referencing benthic macroinvertebrate tallies with physical parameters. For example, sensitive *Plecoptera* (stonefly nymphs) have gill structures that physically cannot survive in dissolved oxygen $<5.0\text{ mg/L}$ or septic conditions. Reporting stoneflies under hypoxia triggers an immediate ecological paradox flag.
4. **Heuristic Confidence & Anomaly Flagging**:
   - Observations with zero automated contradictions receive **"Validated — no automated contradictions detected"** (Validation Confidence: 90–98%).
   - Observations with physical or ecological paradoxes are assigned **"Contradiction Detected"** (Confidence: 35–45%) and tagged with **"HUMAN REVIEW REQUIRED"**.

### Transparent Human-in-the-Loop Philosophy
The system provides explicit, plain-English rationales for every flag (e.g., *"Plecoptera nymphs reported (6), but dissolved oxygen is 3.2 mg/L. Stoneflies require >5.0 mg/L dissolved oxygen to survive."*). It does not claim autonomous certification; rather, it shields baseline data from corruption while empowering community scientists to learn freshwater ecology through constructive feedback.

---

## 5. One Health Impact & Semantic Data Separation

AquaLink enforces a rigorous semantic separation across documentation and user interfaces to prevent confusing measurements with inferences:

### Data Provenance Structure
- **`[OBSERVED]` (Measured Facts)**: Direct field readings including water temperature, pH, dissolved oxygen probe values, optical turbidity, macroinvertebrate counts, and odor observations.
- **`[INFERRED]` (Model-Derived Health & Ecological Signals)**:
  - **Water Quality Index (NSF-WQI)**: Multi-parameter weighted physical-chemical score.
  - **Ecological Health Index (EHI)**: Synthesis of biological tolerance indices (BMWP, Hilsenhoff FBI) and physical parameters.
  - **Waterborne Pathogen Risk Indicator**: Empirical indicator based on turbidity surges, sewage odor reports, and combined sewer overflow conditions.  
    *(Model-derived indicator based on environmental conditions; laboratory confirmation is required).*
  - **Vector-Borne Disease Hazard**: Identifies stagnant, warm ($>20^\circ\text{C}$), hypoxic ($<3.5\text{ mg/L}$) pools where predatory fish are excluded, creating unconstrained breeding habitats for *Culex* mosquitoes (vectors of West Nile virus).
  - **Cyanobacterial Bloom Risk**: Predicts harmful algal bloom potential based on water temperature and nutrient thresholds.
  - **One Health Harmony Score**: Composite index ($0-100$) balancing ecological integrity against public health exposure risks.
- **`[RECOMMENDED ACTION]` (Targeted Directives)**: Actionable guidance for community members (e.g., recreational contact advisories, pet safety notices) and municipal teams (e.g., storm drain dye-tracing, biological larviciding, mechanical weir clearing).

---

## 6. Interoperability & Digital Health Standards (Track 7)

To realize the vision of hackathon sponsors **HL7 Europe** and **EFMI**, AquaLink treats environmental stream data as an upstream determinant of public health:

1. **HL7 FHIR R4 Bundle Generation**:
   - Each observation serializes into a standard FHIR R4 `Bundle` (type: `collection`).
   - Environmental parameters are mapped to official **Regenstrief LOINC** codes:
     - Water Temperature: LOINC `8040-0` (UCUM: `Cel`)
     - pH: LOINC `11558-4` (UCUM: `[pH]`)
     - Dissolved Oxygen: LOINC `2710-2` (UCUM: `mg/L`)
     - Turbidity: LOINC `97561-5` (UCUM: `[NTU]`)
     - Nitrate: LOINC `14860-1` (UCUM: `mg/L`)
     - Phosphate: LOINC `14879-1` (UCUM: `mg/L`)
   - Category mapped to `social-history` (Environmental Exposure).
2. **FHIR `RiskAssessment` Resources**:
   - Inferred pathogen indicators and vector hazards are packaged as standard `RiskAssessment` resources with qualitative risk classifications (`low`, `moderate`, `high`, `critical`) and mitigation directives.
   - HL7 Europe pilot-city extensions attach multi-basin geographic context (`coimbra`, `benevento`, `oslo`, `portland`).
3. **OGC GeoJSON Standard**:
   - Spatial data is exposed via standard OGC GeoJSON `FeatureCollection` format (`urn:ogc:def:crs:OGC:1.3:CRS84`) for direct ingestion into municipal GIS, Copernicus earth observation systems, and urban planning dashboards.

---

## 7. Technical Implementation & Architecture

- **Backend**:
  - **FastAPI** (Python 3.9+) with asynchronous route handling and auto-generated OpenAPI/Swagger documentation.
  - **Pydantic v2** models enforcing strict schema validation on all inputs and calculations.
  - Decoupled modular architecture: `ai_validator.py`, `water_quality.py`, `onehealth_risk.py`, `fhir_converter.py`, `ogc_converter.py`, `seed_data.py`.
- **Frontend**:
  - **React 19** with **TypeScript** for end-to-end type safety.
  - **Vite** build tooling delivering rapid compilation and hot module reloading.
  - **Tailwind CSS** for responsive, accessible styling with clear status color hierarchies.
  - **Leaflet & React-Leaflet** for interactive geospatial mapping with custom SVG markers.
  - **Lucide React** for standardized iconography.
- **Verification & Testing**:
  - **40 backend pytest tests** covering Benson & Krause saturation, BMWP calculations, Hilsenhoff indices, contradiction detection, boundary coordinate handling, missing optional sensor fields, FHIR bundle serialization, and API endpoints.
  - **10 frontend unit tests** verifying rendering, user interactions, decision hierarchy status logic, and state handling.
  - Total: **50 automated tests**, runnable with a single command.
- **Reproducibility**:
  - Multi-stage `Dockerfile`s for both backend and frontend.
  - Single-command orchestration via `docker compose up --build`.

---

## 8. Prototype Scope & Implementation Status

To provide full transparency to judges and reviewers, our prototype scope is divided into what is operational in code today versus what represents demonstration or future roadmap:

| Capability Tier | Scope Description | Implemented Features |
| :--- | :--- | :--- |
| **Fully Implemented** | Operational code executing in the repository today | • 4-rule AI-assisted validation & contradiction detection<br>• Benson & Krause DO saturation & non-linear WQI<br>• BMWP & Hilsenhoff FBI ecological calculations<br>• Model-derived pathogen risk & vector hazard formulations<br>• Dynamic HL7 FHIR R4 bundle & LOINC mapping<br>• OGC GeoJSON CRS84 spatial serialization<br>• 50 automated tests (40 pytest + 10 npm)<br>• Interactive validation explainer & provenance UI |
| **Simulated / Demonstration** | Prototype UI features demonstrating downstream workflows | • Municipal field team dispatch logging (in-memory state simulation)<br>• Seeded network of 30 monitoring stations across 4 pilot basins (Coimbra, Benevento, Oslo, Portland)<br>• Incident briefing document generation |
| **Future Integration** | Requires additional hardware, field trials, or external infrastructure | • Edge-deployed camera vision models for automated macroinvertebrate identification<br>• Continuous IoT water quality buoy streaming via LoRaWAN/MQTT<br>• FHIR-based interoperability with compatible systems (e.g. regional public health and clinical EHR endpoints)<br>• Laboratory wastewater metagenomics sequencing integration |

---

## 9. Alignment with IEEE Hackathon Judging Criteria

### 1. Impact & Relevance (30%)
- Addresses the core mission of IEEE OneAquaHealth by demonstrating how urban freshwater health directly impacts community epidemiology (waterborne pathogens and vector-borne arboviruses).
- Empowers community science volunteers to become trusted sentinels for regional environmental and public health agencies.

### 2. Innovation & Interdisciplinarity (20%)
- Connects three disciplines that rarely communicate: **freshwater limnology** (DO kinetics, macroinvertebrate bio-indicators), **computational epidemiology** (vector breeding dynamics, pathogen surrogates), and **digital health informatics** (HL7 FHIR R4, LOINC).
- Replaces black-box opacity with an explainable AI validation system designed for constructive citizen feedback.

### 3. Technical Quality & Robustness (20%)
- Reproducible working prototype with modular separation of concerns.
- 50 automated tests (40 backend pytest + 10 frontend unit tests) guaranteeing formula accuracy, edge cases, and schema conformance.
- Docker Compose reproducibility allowing judges to run the entire stack with zero manual configuration.

### 4. Usability & User Experience (15%)
- Guided submission wizard with live validation feedback prevents flawed submissions before they reach the server.
- Interactive "How Validation Works" modal demystifies validation rules for non-technical users.
- Clear semantic tags (`[OBSERVED]`, `[INFERRED]`, `[RECOMMENDED ACTION]`) ensure honest and transparent data communication.

### 5. Feasibility & Scalability (15%)
- Designed to work with low-cost field kits ($50–$150 optical DO probes, pH pens, kick nets).
- Lightweight architecture with zero GPU or heavyweight cloud dependencies.
- Open standards (FHIR R4, OGC GeoJSON) enable rapid integration into existing regional public health and municipal GIS infrastructures.
