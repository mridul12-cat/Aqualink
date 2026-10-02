# HL7 FHIR R4 & Digital Health Standards Implementation Guide

## 1. Overview & Hackathon Track 7 Alignment
Track 7 of the IEEE OneAquaHealth Hackathon calls for **Digital Health Standards & Interoperability**, directly appealing to organizational sponsors such as **HL7 Europe** and the **European Federation for Medical Informatics (EFMI)**.

**AquaLink OneHealth** implements native, bidirectional interoperability with healthcare informatics infrastructure by transforming citizen-collected stream observations into standard **HL7 FHIR R4 (Fast Healthcare Interoperability Resources)** bundles.

---

## 2. Resource Mapping & Terminology Architecture

### 2.1 Environmental Observations (`Observation` Resource)
Each environmental parameter is serialized into an individual FHIR `Observation` resource adhering to:
- Profile: `http://hl7.org/fhir/StructureDefinition/Observation`
- Category: `http://terminology.hl7.org/CodeSystem/observation-category` -> `social-history` (Environmental Exposure)
- Standard Vocabulary: **Regenstrief LOINC (Logical Observation Identifiers Names and Codes)**
- Units of Measure: **UCUM (Unified Code for Units of Measure)**

| Parameter | LOINC Code | Long Common Name | UCUM Code | Normal Range |
| :--- | :--- | :--- | :--- | :--- |
| **Water Temperature** | `8040-0` | Temperature of Water | `Cel` | 10.0 - 18.0 Cel |
| **pH of Water** | `11558-4` | pH of Water | `[pH]` | 6.5 - 8.5 [pH] |
| **Dissolved Oxygen** | `2710-2` | Oxygen [Partial pressure/content] in Water | `mg/L` | 7.0 - 12.0 mg/L |
| **Turbidity of Water** | `97561-5` | Turbidity of Water | `[NTU]` | 0.0 - 10.0 [NTU] |
| **Specific Conductance** | `2965-2` | Specific conductance of Water | `uS/cm` | 50 - 500 uS/cm |
| **Nitrate Concentration** | `14860-1` | Nitrate [Mass/volume] in Water | `mg/L` | 0.0 - 5.0 mg/L |
| **Phosphate Concentration** | `14879-1` | Phosphate [Mass/volume] in Water | `mg/L` | 0.0 - 0.1 mg/L |

---

### 2.2 Public Health Hazard Prediction (`RiskAssessment` Resource)
One Health hazard scores and vector predictions are packaged as standard `RiskAssessment` resources:
- Profile: `http://hl7.org/fhir/StructureDefinition/RiskAssessment`
- Qualitative Probability: `http://terminology.hl7.org/CodeSystem/risk-probability` (`low`, `moderate`, `high`, `critical`)
- Outcomes Tracked:
  1. Waterborne Pathogen Infection Hazard (*E. coli*, *Leptospira interrogans*, *Campylobacter*)
  2. Vector-Borne Arboviral Hazard (*Culex pipiens* breeding in stagnant hypoxic reach)
  3. Cyanobacterial Toxin Exposure (Harmful Algal Bloom / Microcystins)

---

## 3. Sample FHIR R4 JSON Representation

```json
{
  "resourceType": "Bundle",
  "id": "urn:uuid:6a12b4e5-9c88-4f21-9402-e2d431c4b123",
  "type": "collection",
  "timestamp": "2026-10-02T18:00:00Z",
  "total": 8,
  "entry": [
    {
      "fullUrl": "urn:uuid:obs-temp-001",
      "resource": {
        "resourceType": "Observation",
        "id": "obs-temp-sta-001",
        "status": "final",
        "category": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                "code": "social-history",
                "display": "Social History / Environmental Exposure"
              }
            ]
          }
        ],
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "8040-0",
              "display": "Water Temperature"
            }
          ]
        },
        "subject": {
          "reference": "Location/upper-columbia-basin",
          "display": "Catchment: Upper Columbia Basin | Stream: Silver Creek"
        },
        "effectiveDateTime": "2026-10-02T17:45:00Z",
        "valueQuantity": {
          "value": 12.4,
          "unit": "Cel",
          "system": "http://unitsofmeasure.org",
          "code": "Cel"
        },
        "interpretation": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                "code": "N",
                "display": "Normal"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

## 4. OGC Sensor Observation Service (SOS) & GeoJSON Integration
AquaLink OneHealth simultaneously exposes stream endpoints via **OGC GeoJSON FeatureCollection** (`urn:ogc:def:crs:OGC:1.3:CRS84`), ensuring that spatial planning agencies, urban geographers, and satellite remote sensing platforms (Copernicus, Landsat) can overlay citizen science data onto GIS layers without conversion overhead.
