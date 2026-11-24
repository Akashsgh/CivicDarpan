# 03. Software Requirements Specification (SRS)

## 1. Functional Requirements (FR)

### FR-1: User Management & Authentication
- **FR-1.1:** The system shall allow citizens to register with name, email, password, and phone number.
- **FR-1.2:** The system shall allow users to log in and receive a signed JWT token valid for 7 days.
- **FR-1.3:** The system shall enforce role-based access control for three roles: `citizen`, `authority`, and `admin`.
- **FR-1.4:** Passwords must be hashed using bcrypt with a minimum work factor of 10 rounds.

### FR-2: Complaint Lifecycle & Reporting
- **FR-2.1:** Citizens shall be able to submit complaints with a title, description, category, photo upload, and map pin location.
- **FR-2.2:** Each complaint shall receive a unique sequential identifier in the format `CIV-YYYY-XXXX`.
- **FR-2.3:** Location coordinates must be stored as GeoJSON `Point` objects `[longitude, latitude]` with a 2dsphere index.
- **FR-2.4:** Citizens can view real-time status progression and resolution proof for their complaints.

### FR-3: AI / ML Integration
- **FR-3.1:** The system shall provide an endpoint `/predict-category` returning predicted category, confidence score, and suggested department.
- **FR-3.2:** When confidence is low (< 40%), the system shall flag it and allow the citizen to override the category.
- **FR-3.3:** The system shall identify duplicate complaints within a 1.5 km vicinity based on Cosine Similarity and Haversine distance.
- **FR-3.4:** The system shall calculate an explainable priority score (High, Medium, Low) with a readable rationale.

### FR-4: Department Authority Management
- **FR-4.1:** Authority staff shall only view complaints assigned to their department.
- **FR-4.2:** Authority staff can update complaint workflow status: `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` or `Rejected`.
- **FR-4.3:** Marking a complaint as `Resolved` requires an update comment and optional resolution photograph.
- **FR-4.4:** Marking a complaint as `Rejected` requires a mandatory rejection reason.

### FR-5: Municipal Administration & Analytics
- **FR-5.1:** Administrators can view system-wide KPI metrics, user directories, departments, and category mappings.
- **FR-5.2:** Administrators can reassign complaints between departments or override priority levels.
- **FR-5.3:** The system shall provide interactive Civic Hotspot density clustering and category distribution charts using Leaflet and Recharts.

---

## 2. Non-Functional Requirements (NFR)

- **NFR-1 (Performance):** AI category prediction and duplicate detection endpoints must respond within 300ms.
- **NFR-2 (Reliability):** Express API must include graceful fallback heuristics if the Python ML service is temporarily unreachable.
- **NFR-3 (Security):** All protected routes must validate JWT signatures; citizen routes must prevent unauthorized viewing of other citizens' complaints.
- **NFR-4 (Usability):** Professional municipal UI styled with Tailwind CSS, responsive on mobile, tablet, and desktop viewports.
- **NFR-5 (Maintainability):** Modular MVC backend architecture, well-documented API contracts, and explainable ML logic suitable for academic viva.
