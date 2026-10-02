# AquaLink OneHealth: Official 4-Minute Video Demo Script & Storyboard
> **IEEE OneAquaHealth Global Hackathon 2026**  
> *Target Duration: 3:45 - 4:15 minutes*

---

## Storyboard Overview & Timeline

| Scene | Duration | Visual on Screen | Speaker Narration / Voiceover |
| :---: | :---: | :--- | :--- |
| **Scene 1** | 0:00 - 0:40 | Title card; news clips of urban water pollution & disease outbreak headline; architecture overview | **The Problem & One Health Gap**: The critical breakdown between environmental stream monitoring and public health response. |
| **Scene 2** | 0:40 - 1:30 | Live UI: Regional Stream Map & Station Profile Modal | **Spatial Intelligence & One Health Scoring**: How freshwater metrics translate into pathogen risk, vector hazards, and recreational advisories. |
| **Scene 3** | 1:30 - 2:35 | Live UI: Field Submission Wizard & Live AI Assistant | **Citizen Science UX & AI Validation (Track 3)**: Live demonstration of instant contradiction detection (the stonefly vs hypoxia paradox). |
| **Scene 4** | 2:35 - 3:20 | Live UI: Resilience Panel & Municipal Triage Desk | **Actionable Intelligence & Early Warning**: Triage alerts, vector breeding warnings, and dispatching interventions. |
| **Scene 5** | 3:20 - 3:55 | Live UI: HL7 FHIR R4 Bundle & LOINC Dictionary | **Standards & Clinical Interoperability (Track 7)**: Connecting citizen science to HL7 Europe, EFMI, and hospital EHRs. |
| **Scene 6** | 3:55 - 4:15 | Summary slide with GitHub repo & hackathon call to action | **Conclusion**: From streams to systems—healthy waters for healthy communities. |

---

## Full Spoken Script

### [0:00 - 0:40] Scene 1: The Problem & The One Health Gap
*(Visual: Camera starts on the AquaLink OneHealth title banner, then transitions to an animated graphic of an urban stream flowing through a dense city.)*

**Speaker:**  
"Every day, millions of citizens walk past urban streams. When heavy storms strike, sewer overflows and agricultural runoff wash pathogens into our waterways, while stagnant, warm reaches become breeding grounds for disease vectors like the *Culex* mosquito. 

Yet today, environmental stream data and public health systems operate in complete silos. Water agencies measure pH and turbidity on spreadsheets, while hospitals and epidemiologists only learn about waterborne outbreaks or vector-borne infections weeks later when patients enter clinics.

Furthermore, when citizen volunteers step up to monitor local waters, regulatory bodies often dismiss their data due to quality concerns and unverified observations.

Welcome to **AquaLink OneHealth**: an autonomous, end-to-end platform built for the IEEE OneAquaHealth Hackathon that transforms citizen science into validated, clinical-grade One Health intelligence."

---

### [0:40 - 1:30] Scene 2: Regional Intelligence Map & One Health Risk Scoring
*(Visual: Switch to browser at `http://localhost:5173`. Show the Regional Stream Map tab. Mouse hovers over color-coded markers. Demonstrate the pilot dropdown switching seamlessly between Coimbra, Benevento, Oslo, and Portland.)*

**Speaker:**  
"Here on the regional dashboard, we see a live watershed monitoring network spanning 30 stations across 4 pilot basins—including official EU Horizon OneAquaHealth pilots in Coimbra, Benevento, and Oslo, alongside our international reference in Portland. Each station is evaluated using our **One Health Composite Engine**. 

Notice how our pins are color-coded:
- Green and cyan pins represent resilient, high-integrity reaches like *Silver Creek Headwaters* or *Coselhas Springs*.
- Yellow pins indicate stressed baselines.
- Rose-colored pins flag severe public health or ecological emergencies.

Let’s click on *Willowbrook Urban Slough*. 

*(Visual: Click on station STA-002 in Portland or PRT-COI-005 in Coimbra. The rich Stream Profile Modal opens, displaying the localized pilot basin flag, station ID, and catchment basin.)*

Instantly, our engine synthesizes raw sensor data into three interconnected One Health pillars:
1. **Water Quality Index (WQI)**: derived from theoretical dissolved oxygen saturation curves.
2. **Ecological Health**: combining BMWP and Hilsenhoff Family Biotic Indices from benthic macroinvertebrates.
3. **Public Health Disease Vector Hazards**: Here, dissolved oxygen has dropped to a hypoxic 2.8 mg/L at 25°C. Our algorithm detects that this hypoxia has eliminated predator fish, creating an optimal, predator-free nursery for *Culex* mosquitoes. It immediately flags a **HIGH Vector-Borne Hazard** and posts an **UNSAFE** recreational advisory."

---

### [1:30 - 2:35] Scene 3: Citizen Field Submission & AI Contradiction Detection (Track 3)
*(Visual: Click over to the 'Field Submit' tab. Show the clean, guided multi-step form.)*

**Speaker:**  
"Now let’s look at Track 1 Citizen Science UX and Track 3 AI-Supported Assessment. 

Volunteers are guided through an intuitive, jargon-free wizard: entering in-situ probe readings, counting macroinvertebrates with one-click counters, and logging field odor and water clarity.

On the right, our **AI Validation Agent** operates continuously as the user types. 

Let's test it with a classic ecological contradiction:
*(Visual: Click the demo button 'Contradiction Paradox'.)*

Watch what happens: The user reported a water clarity of *crystal clear*, but entered a sensor turbidity of *68 NTU*. Even more critically, they reported 6 *Plecoptera stonefly nymphs* in water with a dissolved oxygen of only 3.2 mg/L alongside a sewage odor.

Instantly, our AI Pipeline flags:
- **Flag 1**: Sensor-Visual Contradiction—crystal clear water cannot produce 68 NTU.
- **Flag 2**: Ecological Paradox—stoneflies possess delicate gills that physically suffocate in oxygen below 5 mg/L.
- The AI explains the scientific rationale in plain English and drops data confidence to 45%, setting a **Human-in-the-Loop** flag so anomalous data cannot corrupt regulatory baselines!

Now let’s load a certified pristine observation:
*(Visual: Click 'Pristine Headwater' button. The badge flashes green: 100% Confidence, Certified.)*

With zero contradictions, the volunteer clicks **Certify & Submit**, instantly incorporating their findings into regional surveillance."

---

### [2:35 - 3:20] Scene 4: Early Warning & Municipal Resilience Center
*(Visual: Click on the 'Resilience' tab. Show the hazard counters and active directives.)*

**Speaker:**  
"For municipal authorities and watershed managers, AquaLink OneHealth serves as an automated Early Warning triage center.

Instead of deciphering raw numbers, municipal officers see direct, actionable directives:
- Waterborne Pathogen Alerts prompt sewer outfall dye tracing.
- Stagnant Vector Triggers recommend immediate culvert clearing and biological larvicide application.
- Toxic Cyanobacteria warnings prompt immediate signage to protect children and pets.

With a single click, officers can log municipal dispatch or print a formal incident briefing for public health teams."

---

### [3:20 - 3:55] Scene 5: Digital Health Standards & Interoperability (Track 7)
*(Visual: Click on the 'HL7 FHIR / OGC' tab. Show the live JSON viewer and LOINC table.)*

**Speaker:**  
"To satisfy the core objectives of Track 7 and hackathon sponsors **HL7 Europe** and **EFMI**, AquaLink OneHealth breaks through the digital health barrier.

Every single field observation is dynamically converted into an **HL7 FHIR R4 Bundle**. 
- Temperature is mapped to LOINC `8040-0`.
- pH to LOINC `11558-4`.
- Dissolved oxygen to LOINC `2710-2`.
- Pathogen and vector risks are exported as standard FHIR `RiskAssessment` resources.

This means a regional hospital EHR or public health surveillance network can ingest this data directly, enabling doctors to cross-reference patient symptoms with upstream stream contamination in real time. 

Simultaneously, we expose an **OGC GeoJSON** endpoint for spatial GIS and satellite earth observation networks."

---

### [3:55 - 4:15] Scene 6: Conclusion
*(Visual: Return to the full dashboard overview with all tabs and stats visible.)*

**Speaker:**  
"AquaLink OneHealth is fully production-ready: built with FastAPI, 41 automated tests (32 backend + 9 frontend), React 19, and single-command Docker Compose reproducibility.

By uniting citizen science, explainable artificial intelligence, and digital health standards, we turn streams into systems—empowering healthy waters, healthy ecosystems, and healthy communities.

Thank you!"
