# Devpost Submission: AquaLink OneHealth

## Project Name
**AquaLink OneHealth: From Streams to Systems**

## Tagline
*Turning citizen-generated environmental stream observations into actionable, clinical-grade One Health intelligence.*

---

## 1. Track Alignment Statement
AquaLink OneHealth directly targets **Track 3 (AI-Supported Assessment)** and **Track 7 (Digital Health Standards & Interoperability)**, while seamlessly integrating **Track 1 (Citizen Science UX)** and **Track 2 (Data-to-Insight)**.

- **Primary Track 3 (AI-Supported Assessment)**: We deployed a multi-stage AI verification pipeline that evaluates physical-chemical gas solubility laws (Weiss 1970 DO saturation), flags sensor-visual discrepancies (e.g., claiming crystal clear water at 85 NTU), and detects complex biological paradoxes (e.g., reporting sensitive *Plecoptera* stonefly nymphs in hypoxic or sewage-laden water). The engine outputs an explainable confidence score and scientific rationale, requesting human-in-the-loop review when contradictions occur.
- **Primary Track 7 (Digital Health Standards)**: To bridge environmental observations with clinical medicine and epidemiological registries (answering the mission of hackathon sponsors **HL7 Europe** and **EFMI**), AquaLink OneHealth converts every citizen observation into standards-compliant **HL7 FHIR R4 `Observation` and `RiskAssessment` resources** coded with official **LOINC** concepts, alongside **OGC GeoJSON** for spatial sensor networks.
- **Secondary Tracks 1 & 2**: A guided, jargon-free field submission wizard with instant client-side feedback empowers non-expert volunteers, while an interactive regional map and resilience center translate complex sensor data into plain-language disease vector advisories for municipal authorities.

---

## 2. Problem Statement & Background
Urban streams are the ecological lifeblood of cities and the earliest sentinels of environmental deterioration. However, modern environmental monitoring faces three critical breakdowns:

1. **The Data Quality Paradox in Citizen Science**: Field volunteers provide indispensable spatial coverage, but data is frequently challenged by regulatory agencies due to probe calibration drift, specimen misidentification, and observational errors.
2. **The Environmental-to-Clinical Silo**: Water quality reports live in environmental protection agency silos, while public health hospitals and clinical registries only discover waterborne outbreaks (*E. coli*, *Campylobacter*, *Leptospira*) or vector-borne epidemics (*Culex* mosquito-borne West Nile) weeks later when patients enter clinics.
3. **Absence of Actionable Translation**: Reporting a turbidity of "45 NTU" or a dissolved oxygen of "3.2 mg/L" means little to community members and busy municipal emergency managers unless translated into plain-language risk directives (e.g., "Hypoxia in stagnant pools has eliminated predatory fish, triggering an imminent mosquito breeding spike; dispatch biological larvicide").

---

## 3. What AquaLink OneHealth Does
AquaLink OneHealth bridges these gaps with an end-to-end platform:

1. **Citizen Field Observation Wizard**: Non-expert volunteers input physical-chemical readings, benthic macroinvertebrates (mayflies, stoneflies, tubifex worms), and visual conditions (odor, sheen, flow).
2. **Instant AI Validation & Contradiction Agent**: As the volunteer fills out the form, an AI engine checks the data in real-time. If an ecological paradox (e.g., stoneflies in hypoxic water) or physical impossibility is entered, the system highlights the discrepancy, explains the scientific rationale, and guides the user to re-verify.
3. **One Health Composite Risk Engine**: The system calculates:
   - **Water Quality Index (NSF-WQI)** and **Ecological Health Index (EHI)** using BMWP and Hilsenhoff Family Biotic Index (FBI).
   - **Waterborne Pathogen Risk Index**: Turbidity surrogate model combined with sewer overflow indicators.
   - **Disease Vector Proliferation Hazard**: Pinpointing stagnant, warm, hypoxic pools where mosquito larvae thrive in the absence of fish predation.
   - **Harmful Algal Bloom (HAB) Risk**: Eutrophic nutrient triggers and photosynthetic oxygen supersaturation.
   - **Public Contact & Pet Safety Advisories**: Safe, Caution, or Unsafe.
4. **Regional Intelligence Map & Early Warning Resilience Desk**: Municipal teams and community groups view a live, color-coded map with automated alerts and dispatch municipal interventions (aeration, larviciding, signage).
5. **Standards-Compliant Digital Health Export**: Transforms every observation into HL7 FHIR R4 and OGC GeoJSON formats for immediate ingestion by hospital electronic health records and European public health observatories.

---

## 4. How We Built It (Technical Architecture)

- **Backend Service**: Built with **FastAPI** (Python 3.9+) and **Pydantic v2**, structured as a modular, decoupled engine:
  - `water_quality.py`: Implements the USGS Benson & Krause (1984) formulation for DO saturation, non-linear WQI curves, and benthic macroinvertebrate tolerance weighting.
  - `onehealth_risk.py`: Algorithmic mapping of chemical and biological indicators to human disease vectors and ecological resilience tiers.
  - `ai_validator.py`: Multi-stage heuristic and reasoning agent validating physical constraints, sensor-visual concordance, and ecological guild consistency.
  - `fhir_converter.py`: HL7 FHIR R4 transformer mapping parameters to standard LOINC codes (`8040-0` Water Temp, `11558-4` pH, `2710-2` DO, `97561-5` Turbidity, `14860-1` Nitrate, `14879-1` Phosphate) and generating FHIR `RiskAssessment` resources.
  - `ogc_converter.py`: Exports spatial data adhering to OGC GeoJSON CRS84 specifications.
  - `seed_data.py`: Seeded network of 12 diverse urban stream stations across pristine headwaters, agricultural runoffs, industrial culverts, and restored wetlands.
- **Frontend Dashboard**: Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**:
  - Interactive Leaflet geospatial map with custom SVG risk pins and stream profile popups.
  - Guided observation wizard with live debounced AI validation feedback.
  - Early Warning Resilience Panel with municipal dispatch simulation.
  - Interactive Watershed Analytics comparing EPT biodiversity and catchment baselines.
  - Interactive Standards Inspector with live FHIR R4 Bundle and OGC GeoJSON viewers.
- **Automated Verification**: Monorepo includes **27 automated pytest tests** and **5 frontend unit tests** covering physical-chemical calculations, bio-indices, pathogen risk, vector hazards, contradiction detection, and REST endpoints.
- **Single-Command Reproducibility**: Containerized using multi-stage `Dockerfile`s and a root `docker-compose.yml`.

---

## 5. Feasibility, Scalability & Future Roadmap

### Technical Feasibility
AquaLink OneHealth was engineered from day one to operate with low-cost field sensors (optical DO probes, pH pens, Secchi tubes) and standard citizen science benthic kick-net kits. By standardizing outputs to HL7 FHIR R4, any healthcare authority with a FHIR-compliant repository (e.g., HAPI FHIR, Google Cloud Healthcare API, Azure Health Data Services) can connect to the platform in hours.

### Scalability Strategy
1. **Edge-Ready Client Validation**: The client-side form provides immediate local sanity checking, reducing server load and invalid network roundtrips.
2. **Microservices Decoupling**: The AI validation agent, risk synthesis engine, and FHIR export pipeline can be scaled independently as cloud-native microservices or serverless functions.
3. **Sensor-to-Cloud Automation**: Integration with low-power LoRaWAN and IoT water quality buoys for automated continuous baseline streaming, complemented by citizen ground-truthing.

### Future Roadmap
- **Q3 2026**: Pilot deployment with regional European watershed partnerships and citizen science river trusts.
- **Q4 2026**: Direct EHR integration pilot with an EFMI-affiliated regional hospital network to correlate upstream CSO events with emergency department gastrointestinal admissions.
- **Q1 2027**: On-device vision model (TensorFlow Lite / WebML) for offline automated macroinvertebrate identification from mobile camera snapshots.
