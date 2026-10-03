# AquaLink: 4-Minute Video Demo Script & Storyboard
> **IEEE OneAquaHealth Global Hackathon 2026**  
> *Target Duration: 3:45 – 4:15 minutes*  
> *Key Position: AquaLink helps communities monitor urban streams by turning citizen observations into validated ecosystem-health signals, public-health risk indicators, and actionable alerts.*

---

## Storyboard Overview & Master Timeline

| Scene | Timestamp | Screen / Location | Primary Focus | Narrative Beat |
| :---: | :---: | :--- | :--- | :--- |
| **Scene 1** | 0:00 – 0:20 | Splash / Regional Map overview (`http://localhost:5173`) | **Problem & Value Proposition** | The disconnect between community stream monitoring, ecological health, and public health action. |
| **Scene 2** | 0:20 – 1:00 | Regional Map & Station Profile Modal (`Urban Paradox Creek` / `Willowbrook Urban Slough`) | **Show the Outcome First** | Full One Health assessment: WQI, EHI, model-derived pathogen indicators, vector hazards, and actionable municipal directives. |
| **Scene 3** | 1:00 – 2:00 | Field Submit Tab (`ObservationForm`) & Validation Explainer Modal | **AI-Assisted Validation in Action** | Input realistic contradiction → "Contradiction Detected" → Click "Why? / How Validation Works" modal → Human review required → Load consistent observation. |
| **Scene 4** | 2:00 – 2:40 | Resilience Tab (`EarlyWarningPanel`) | **Actionable Intelligence & Triage** | Translating validated signals into early warnings, triage directives, and municipal field dispatches. |
| **Scene 5** | 2:40 – 3:15 | Standards Interop Modal (`InteropModal`) | **Digital Health & Geospatial Standards** | Native HL7 FHIR R4 Bundle with LOINC codes & OGC GeoJSON export for public health and environmental registries. |
| **Scene 6** | 3:15 – 3:45 | Terminal & Architecture Overview | **Technical Rigor & Verification** | 41 automated tests (32 pytest + 9 npm), FastAPI + React 19 stack, Docker Compose reproducibility. |
| **Scene 7** | 3:45 – 4:05 | Full Dashboard view | **Closing & One Health Vision** | "From seeing a problem in the water to understanding what it means and what should happen next." |

---

## Detailed Scene-by-Scene Script

### [0:00 – 0:20] Scene 1: The Problem & Value Proposition
**Screen Visual:**
- Browser opened to `http://localhost:5173`.
- The AquaLink header displays: *"AI-Assisted Citizen Science & One Health Early Warning Platform"*.
- Map displays 30 monitoring stations across 4 international pilot basins (Coimbra, Benevento, Oslo, Portland) with color-coded risk markers.

**Speaker Narration:**
> *"Every day, community volunteers walk urban streams, collecting vital environmental data. But raw numbers often hit dead ends: agencies question unverified data, public health teams operate in silos, and communities don't know what action to take.*
> 
> *AquaLink bridges this gap: turning citizen observations into validated ecosystem-health signals, public-health risk indicators, and actionable alerts."*

**Visual Cue for Recorder:**
- Pan gently across the regional map showing station markers.
- Show the pilot selector dropdown switching between Coimbra, Benevento, Oslo, and Portland.

---

### [0:20 – 1:00] Scene 2: Show the Outcome First (One Health Intelligence)
**Screen Visual:**
- Click on station **`STA-002: Willowbrook Urban Slough`** (or `PRT-COI-005` in Coimbra).
- The **Stream Detail Modal** opens up with clear semantic sections: `[OBSERVED]`, `[INFERRED]`, and `[RECOMMENDED ACTION]`.
- Highlight the **One Health Harmony Score (41/100 - Degraded)**.

**Speaker Narration:**
> *"Let’s look at the destination first: what does a community or public health authority actually see?*
> 
> *When we open Willowbrook Slough, AquaLink immediately breaks down the site into three distinct layers:*
> - *First, **Observed Physical Parameters**: 24.8°C water temperature, 2.8 mg/L dissolved oxygen, and high organic pollution.*
> - *Second, **Inferred One Health Signals**: dissolved oxygen saturation is down to 34%—a severe hypoxic state. Because fish predators cannot survive in hypoxia, this creates a prime breeding habitat for Culex mosquitoes, flagging an **Elevated Vector-Borne Hazard (76/100)**. Turbidity and sewage indicators trigger a **High Waterborne Pathogen Risk Indicator (72/100)**—clearly marked as a model-derived indicator requiring laboratory confirmation.*
> - *Third, **Recommended Actions**: an Unsafe recreational advisory, combined sewer overflow inspection, and targeted biological larviciding."*

**Visual Cue for Recorder:**
- Point cursor to the `[OBSERVED]` sensor strip.
- Hover over the **Waterborne Pathogen Risk Indicator** card to highlight the *(Model-derived indicator based on environmental conditions; laboratory confirmation is required)* notice.
- Scroll to the `[RECOMMENDED ACTION]` section to show specific field directives.

---

### [1:00 – 2:00] Scene 3: Citizen Science Submission & AI-Assisted Validation
**Screen Visual:**
- Close modal and switch to the **"Field Submit"** tab (`ObservationForm.tsx`).
- Show the guided 4-step wizard: Probe Readings, Macroinvertebrates, Visual/Odor, Review.
- Click the preset demo button: **"Contradiction Paradox"**.

**Speaker Narration:**
> *"Now let's see how we get here. How can citizen science be trusted for One Health surveillance without claiming unrealistic automated perfection?*
> 
> *Here in our Field Submission Wizard, a volunteer enters stream data. Let's load a realistic field scenario containing an ecological paradox.*
> 
> *Look at the live validation card on the right: the engine immediately flags **Contradiction Detected** and drops validation confidence to 45%.*
> 
> *Why? Let's click **'Why? How Validation Works'**.*
> 
> *(Click 'Why? How Validation Works' button to open the Validation Explainer Modal).*
> 
> *AquaLink’s validator isn’t an opaque black box. It's an explainable, rule-based consistency engine built on freshwater science:*
> 1. *It detected that reporting 'Crystal Clear' water contradicts an instrument turbidity of 68 NTU.*
> 2. *More critically, the observer reported 6 Plecoptera stonefly nymphs in water with only 3.2 mg/L dissolved oxygen. Stoneflies possess delicate tracheal gills that suffocate below 5.0 mg/L.*
> 
> *Rather than silently rejecting or guessing, AquaLink tags this observation: **'HUMAN REVIEW REQUIRED'**. It protects baseline integrity while keeping the human in the loop.*
> 
> *(Close modal, click 'Pristine Headwater' preset).*
> 
> *When consistent data is entered, no automated contradictions are detected, and the observation is accepted for One Health surveillance."*

**Visual Cue for Recorder:**
- Click "Contradiction Paradox". The amber/red warning appears with specific bullet points.
- Click "Why? How Validation Works" to open the interactive `ValidationExplainerModal`. Show the 4 scientific rule cards.
- Close modal. Click "Pristine Headwater". Show the green status: *"Validated — No Automated Contradictions Detected"*. Click *"Verify & Submit"*.

---

### [2:00 – 2:40] Scene 4: Early Warning & Municipal Resilience
**Screen Visual:**
- Switch to the **"Resilience"** tab (`EarlyWarningPanel.tsx`).
- Display the active hazard triage queue, summary alert counters, and municipal intervention cards.

**Speaker Narration:**
> *"Once validated, observations flow directly into the Early Warning Resilience Desk.*
> 
> *Instead of burying municipal teams in raw sensor logs, AquaLink synthesizes catchment-level hazards:*
> - *Pathogen Risk Indicators aggregate turbidity anomalies and sewage odor reports across stations.*
> - *Vector Breeding alerts prioritize stagnant, hypoxic reaches for proactive vector control before mosquito emergence.*
> - *Cyanobacterial bloom alerts warn of pet toxicity risks.*
> 
> *Watershed managers can review real-time incident briefs, dispatch municipal field teams with one click, and coordinate proactive interventions before public health crises escalate."*

**Visual Cue for Recorder:**
- Click on an active alert card.
- Click the *"Dispatch Field Team"* or *"Print Incident Brief"* button to demonstrate municipal workflow simulation.

---

### [2:40 – 3:15] Scene 5: Digital Health Standards & Interoperability
**Screen Visual:**
- Click the **"Digital Health (FHIR / OGC)"** navigation button to open the Interoperability Modal (`InteropModal.tsx`).
- Show the **HL7 FHIR R4 Bundle** tab with live JSON viewer, then switch to the **LOINC Vocabulary** and **OGC GeoJSON** tabs.

**Speaker Narration:**
> *"To bridge environmental monitoring with public health registries, AquaLink implements standard digital health interoperability, addressing Track 7.*
> 
> *Every observation can be exported dynamically as an **HL7 FHIR R4 Bundle**:*
> - *Water temperature maps to LOINC `8040-0`.*
> - *pH maps to LOINC `11558-4`.*
> - *Dissolved oxygen maps to LOINC `2710-2`.*
> - *Pathogen and vector risks are packaged as standardized FHIR `RiskAssessment` resources.*
> 
> *This allows public health epidemiologists and environmental health surveillance systems to consume validated stream observations using the same open data standards as modern healthcare registries.*
> 
> *Simultaneously, our **OGC GeoJSON** endpoint provides geospatial interoperability for municipal GIS and urban planning platforms."*

**Visual Cue for Recorder:**
- Toggle between the `HL7 FHIR R4 Bundle` code tab and the `LOINC Concept Dictionary` table.
- Click `Copy FHIR JSON` to highlight developer accessibility.
- Switch to the `OGC GeoJSON` tab showing standard CRS84 spatial coordinates.

---

### [3:15 – 3:45] Scene 6: Technical Rigor, Verification & Reproducibility
**Screen Visual:**
- Cut briefly to split-screen: VS Code / Terminal running automated test suites.
- Show `pytest backend/tests` passing 32 tests.
- Show `npm test` passing 9 frontend tests.
- Show `docker-compose.yml` and clean multi-stage architecture.

**Speaker Narration:**
> *"Behind the interface is a robust, production-tested architecture:*
> - *FastAPI backend with Pydantic v2 data models.*
> - *React 19, TypeScript, and Tailwind CSS frontend.*
> - *Strict physical-chemical formulations including USGS Benson & Krause dissolved oxygen kinetics, BMWP macroinvertebrate weighting, and Hilsenhoff biotic indexing.*
> - *41 automated tests—32 backend pytest unit tests and 9 frontend unit tests—verifying validation rules, hazard formulas, and FHIR serialization.*
> - *And full reproducibility via single-command Docker Compose."*

**Visual Cue for Recorder:**
- Show terminal with green test execution output (`32 passed in 0.53s`, `9 passed in 0.22s`).
- Show clean architecture diagram or terminal showing both backend and frontend running.

---

### [3:45 – 4:05] Scene 7: Conclusion & The One Health Vision
**Screen Visual:**
- Return to the live AquaLink Regional Stream Map dashboard.
- Mouse hovers over the catchment statistics bar and pilot city selector.

**Speaker Narration:**
> *"Urban streams are the earliest indicators of environmental degradation and community health risk.*
> 
> *AquaLink turns citizen observations into validated One Health intelligence—helping communities move from seeing a problem in the water to understanding what it means and what should happen next.*
> 
> *Thank you."*

**Visual Cue for Recorder:**
- Hold on the live dashboard overview with all monitoring stations and One Health metrics clearly visible. Fade to black or display repository URL.

---

## Production & Recording Checklist

- [ ] **Backend running**: `cd backend && source venv/bin/activate && uvicorn app.main:app --port 8000`
- [ ] **Frontend running**: `cd frontend && npm run dev` (running at `http://localhost:5173`)
- [ ] **Browser zoom level**: 100% or 110% on 1920x1080 resolution.
- [ ] **Audio**: Clear microphone with noise suppression enabled.
- [ ] **Pacing**: Steady, conversational tempo (~135-145 words per minute).
- [ ] **Key Disclaimers Present**: Ensure the pathogen risk indicator model-derived disclaimer and human-in-the-loop validation tags are visible on screen.
