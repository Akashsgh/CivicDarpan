# 05. Use Case Specification & Diagram

## 1. Actors
- **Citizen:** Public user who reports civic grievances, uploads photographs, selects locations on the map, and tracks resolution progress.
- **Authority Staff (Field Officer):** Municipal department employee who inspects assigned complaints, verifies AI recommendations, advances workflow statuses, and uploads resolution evidence.
- **Administrator:** Municipal executive with city-wide privileges to manage users, configure departments, monitor civic hotspot density, and reassign stalled complaints.
- **AI / ML Service:** Autonomous computational actor that classifies complaint descriptions, flags duplicate reports, and recommends priority scores.

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    Citizen((Citizen))
    Staff((Authority Staff))
    Admin((Administrator))
    MLService((AI/ML Service))

    subgraph Portal ["CivicLens Platform"]
        UC1["Register & Authenticate"]
        UC2["Submit Complaint with Photo & GPS"]
        UC3["Track Complaint Status & Timeline"]
        UC4["View Resolution Proof & Comments"]
        
        UC5["View Department Assigned Complaints"]
        UC6["Review AI Category & Priority Suggestions"]
        UC7["Identify & Verify Duplicate Flags"]
        UC8["Update Status (In Progress / Resolved)"]
        UC9["Upload Resolution Evidence Photo"]

        UC10["View Municipal Hotspot Density Map"]
        UC11["Manage Users & Authority Accounts"]
        UC12["Manage Departments & Categories"]
        UC13["Reassign Complaints & Override Priority"]

        UC14["Predict Issue Category & Division"]
        UC15["Detect Nearby Duplicate Issues"]
        UC16["Calculate Multi-Factor Priority Score"]
    end

    Citizen --> UC1
    Citizen --> UC2
    Citizen --> UC3
    Citizen --> UC4

    Staff --> UC1
    Staff --> UC5
    Staff --> UC6
    Staff --> UC7
    Staff --> UC8
    Staff --> UC9

    Admin --> UC1
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13

    UC2 -.->|Triggers| UC14
    UC2 -.->|Triggers| UC15
    UC2 -.->|Triggers| UC16

    UC14 --> MLService
    UC15 --> MLService
    UC16 --> MLService
```
