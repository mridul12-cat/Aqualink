# AquaLink OneHealth: Scientific & Algorithmic Framework

## 1. Executive Summary & OneAquaHealth Alignment
The IEEE OneAquaHealth initiative advocates for a **"One Health"** paradigm: the health of human communities is inextricably linked to the biological integrity of urban freshwater ecosystems and surrounding animal vectors. 

Urban streams are the ultimate sentinels of environmental health. However, conventional monitoring data is severely siloed: municipal hydrologists measure water quality in disconnected spreadsheets, while public health epidemiologists monitor waterborne illness or mosquito-borne disease outbreaks weeks later in clinics and hospitals.

**AquaLink OneHealth** provides the missing algorithmic bridge: converting field observations from citizen science streamkeepers into instant, validated, actionable One Health intelligence. The platform is calibrated across 30 monitoring stations situated across 4 international river basins: the official EU Horizon OneAquaHealth pilots in **Coimbra, Portugal** (6 stations), **Benevento, Italy** (6 stations), and **Oslo, Norway** (6 stations), paired with reference urban streams in **Portland, USA** (12 stations).

---

## 2. Mathematical & Algorithmic Foundations

### 2.1 Dissolved Oxygen Saturation & Temperature Kinetics
Dissolved oxygen (DO) saturation in freshwater at atmospheric pressure is calculated using the USGS standard Benson & Krause (1984) formulation:

$$\ln(DO_{sat}) = -139.34411 + \frac{1.575701 \times 10^5}{T_K} - \frac{6.642308 \times 10^7}{T_K^2} + \frac{1.243800 \times 10^{10}}{T_K^3} - \frac{8.621949 \times 10^{11}}{T_K^4}$$

Where $T_K = T_{celsius} + 273.15$. Percent saturation is derived as:
$$\%Sat = \left(\frac{DO_{measured}}{DO_{sat}(T)}\right) \times 100\%$$

- **Hypoxia ($\%Sat < 40\%$)**: Disrupts aquatic respiration, triggers fish kills, and eliminates macroinvertebrate predators.
- **Supersaturation ($\%Sat > 125\%$)**: Indicates hyper-productive photosynthetic blooms from excessive phytoplankton or cyanobacteria, leading to nocturnal dissolved oxygen crashes.

---

### 2.2 Water Quality Index (WQI) Sub-Index Modeling
AquaLink OneHealth computes a modified National Sanitation Foundation Water Quality Index (NSF-WQI) based on non-linear parameter curves:
$$WQI = \sum_{i=1}^n w_i \cdot q_i$$
- **Dissolved Oxygen Sub-index ($w = 0.32$)**: Quadratic curve peaking near 100% saturation.
- **pH Sub-index ($w = 0.22$)**: Optimal freshwater life band between 6.8 and 8.2 ($q \approx 98$); severe penalization outside 5.5 - 9.0.
- **Turbidity Sub-index ($w = 0.18$)**: Exponential decay penalty as turbidity exceeds 10 NTU.
- **Temperature Deviation ($w = 0.13$)**: Penalizing thermal urban heat island warming above 20°C.
- **Nutrients (Nitrates & Phosphates) ($w = 0.15$)**: Accounting for eutrophication potential.

---

### 2.3 Biological Benthic Macroinvertebrate Metrics

#### Biological Monitoring Working Party (BMWP)
Macroinvertebrate taxa are weighted according to their physiological sensitivity to organic pollution:
- **Group 1 (Pollution Sensitive, Score = 6-10)**: *Plecoptera* (Stonefly nymphs, 10), *Ephemeroptera* (Mayfly nymphs, 10), *Trichoptera* (Caddisfly larvae, 10), *Gammaridae* (Freshwater Shrimp, 6).
- **Group 2 (Moderately Tolerant, Score = 5-8)**: *Odonata* (Dragonfly nymphs, 8), *Coleoptera* (Beetle larvae, 5), *Diptera: Simuliidae* (Blackfly larvae, 5).
- **Group 3 (Organic Pollution Tolerant, Score = 1-3)**: *Oligochaeta* (Tubifex sludge worms, 1), *Hirudinea* (Leeches, 3), *Chironomidae* (Bloodworms/Midges, 2), *Gastropoda* (Pouch snails, 3).

#### Hilsenhoff Family Biotic Index (FBI)
$$FBI = \frac{\sum (n_i \cdot t_i)}{N}$$
Where $n_i$ is the count of taxon $i$, $t_i$ is the tolerance value (0-10), and $N$ is total individuals. An FBI $> 7.5$ indicates severe organic pollution and sewage sludge accumulation.

#### Ecological Health Index (EHI)
$$EHI = (WQI \times 0.55) + (BioComposite \times 0.45) - FishKillPenalty$$

---

## 3. Public Health Hazard Vector Formulations

### 3.1 Waterborne Pathogen Risk Index (0-100)
*(Model-derived indicator based on environmental conditions; laboratory confirmation is required)*

Turbidity serves as a primary empirical surrogate for suspended sediment-bound bacterial load (*E. coli*, *Campylobacter*, *Cryptosporidium*, *Leptospira interrogans*):
$$PathogenScore = Baseline(15) + f(Turbidity) + CSO\_Rainfall(20) + SewageOdor(35) + TempIncubation(10) + TubifexDominance(15)$$

- **Critical Risk ($\ge 75$)**: Mandates immediate contact prohibition and sewer outfall dye tracing.
- **High Risk ($50-74$)**: Public caution, recreational warning, pet prohibition.

### 3.2 Vector-Borne Disease Hazard (0-100)
Mosquito breeding (*Culex pipiens*, vector of West Nile Virus and St. Louis Encephalitis) is driven by an ecological vulnerability loop:
1. **Flow Stagnation**: Standing pools allow oviposition and larval development without physical disruption ($+40$ pts).
2. **Thermal Acceleration**: Water temperatures between 20°C and 32°C compress the larval instars from 14 days down to 6 days ($+25$ pts).
3. **Predator Exclusion via Hypoxia**: When dissolved oxygen falls below 3.5 mg/L, predatory fish (*Gambusia*, juvenile salmonids) and dragonfly nymphs perish, leaving mosquito larvae (which breathe atmospheric air via caudal spiracles/siphons) free of predation ($+25$ pts).

### 3.3 Cyanobacterial Harmful Algal Bloom (HAB) Risk (0-100)
Eutrophic orthophosphate concentrations ($>0.10$ mg/L) combined with warm temperatures ($>22^\circ\text{C}$) and daytime oxygen supersaturation ($>125\%$) indicate imminent microcystin hepatotoxin and neurotoxin release.

---

## 4. Composite One Health Harmony Score
The composite index provides a single interpretable metric ($0-100$):
$$\text{OneHealthScore} = (EHI \times 0.40) + ((100 - PathogenRisk) \times 0.25) + ((100 - VectorHazard) \times 0.20) + ((100 - HABRisk) \times 0.15)$$

- **$85 - 100$**: Thriving Stream & Healthy Community (Safe recreation, high ecological resilience).
- **$70 - 84$**: Balanced Ecosystem (Baseline surveillance).
- **$50 - 69$**: Stressed Ecosystem (Moderate public health exposure, targeted remediation).
- **$30 - 49$**: Degraded Watershed (High pathogen/vector hazard, active municipal intervention required).
- **$< 30$**: Critical Sanitary & Ecological Emergency (Immediate closure & containment).
