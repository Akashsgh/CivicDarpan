# 02. Problem Statement & Objectives

## 1. Problem Statement
In rapidly expanding urban municipalities, civic infrastructure issues such as cratered potholes, open manholes, overflowing dumpsters, unlit streets, and broken water mains severely disrupt citizen life and endanger public safety. Current municipal grievance mechanisms suffer from critical limitations:

1. **Information Asymmetry & Vague Reporting:** Citizens report problems over phone helplines or paper forms without GPS coordinates or visual evidence, leading to delayed site identification by field teams.
2. **Departmental Siloing:** Issues are routinely misrouted between roads, sanitation, electricity, and water divisions, bouncing between desks for weeks.
3. **Duplicate Report Fatigue:** When a major water main bursts or a road craters, dozens of citizens report the same issue. Municipal desks treat each report as a distinct ticket, wasting administrative hours on deduplication.
4. **Arbitrary Prioritization:** Complaints are often processed on a first-come, first-served basis rather than by public safety hazard urgency.
5. **Lack of Resolution Accountability:** Complaints are frequently closed administratively without ground verification or evidence provided back to the citizen.

---

## 2. Project Objectives
CivicLens was architected with the following core engineering objectives:

### Primary Objectives
- **Centralized Geo-Referenced Portal:** Enable citizens to report civic grievances with photos and GPS coordinates on an interactive OpenStreetMap interface.
- **Automated Explainable Classification:** Train an explainable NLP classifier (TF-IDF + Logistic Regression) that predicts complaint category and maps to the appropriate municipal division with confidence scores.
- **Dual-Factor Duplicate Detection:** Detect candidate duplicates using combined textual similarity (Cosine Similarity) and geographic proximity (Haversine distance formula) within a defined spatial radius.
- **Explainable Priority Recommendation:** Formulate transparent multi-factor scoring based on hazard keywords, report density, category baselines, and SLA aging.
- **Civic Hotspot Mapping:** Implement geospatial clustering to identify geographic zones with repeated infrastructure breakdowns.
- **Tamper-Evident Status Auditing:** Enforce a step-by-step workflow with chronological history records and mandatory resolution evidence photographs.

---

## 3. Project Scope & Boundaries
- **Target Geography:** Single-city municipal corporation (Delhi NCR metropolitan area used for realistic demonstration).
- **Scalability Structure:** Flexible database schemas using normalized MongoDB references, allowing effortless future expansion to multi-city hierarchies.
- **Budgetary Constraints:** 100% free and open-source stack (no paid Google Maps APIs or cloud proprietary services).
