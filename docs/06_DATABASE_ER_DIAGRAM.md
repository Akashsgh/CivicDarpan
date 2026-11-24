# 06. Database Schema & Entity-Relationship (ER) Diagram

## 1. Relational Entity Overview
Although MongoDB is a document-oriented NoSQL database, CivicLens maintains clean, normalized relations using Mongoose `ObjectId` references. This prevents data duplication and maintains strict integrity.

---

## 2. Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ COMPLAINT : "reports"
    USER ||--o{ COMPLAINT_UPDATE : "authors"
    DEPARTMENT ||--o{ USER : "employs"
    DEPARTMENT ||--o{ COMPLAINT : "handles"
    DEPARTMENT ||--o{ CATEGORY : "supports"
    COMPLAINT ||--o{ COMPLAINT_UPDATE : "tracks"
    COMPLAINT ||--o| COMPLAINT : "duplicateOf"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "citizen | authority | admin"
        string phone
        ObjectId departmentId FK
        string designation
        boolean isActive
        date createdAt
    }

    DEPARTMENT {
        ObjectId _id PK
        string name UK
        string code UK
        string description
        string[] supportedCategories
        string contactEmail
        string contactPhone
        boolean isActive
        date createdAt
    }

    CATEGORY {
        ObjectId _id PK
        string name UK
        string code UK
        string description
        ObjectId defaultDepartmentId FK
        string defaultPriority "Low | Medium | High"
        number severityBaseScore
        boolean isActive
        date createdAt
    }

    COMPLAINT {
        ObjectId _id PK
        string complaintId UK "e.g. CIV-2026-0001"
        string title
        string description
        string category
        string imageUrl
        Point location "GeoJSON [lng, lat]"
        ObjectId citizenId FK
        ObjectId departmentId FK
        ObjectId assignedTo FK
        string status "Submitted | Under Review | Assigned | In Progress | Resolved | Rejected"
        string priority "Low | Medium | High"
        number priorityScore
        string priorityReason
        string aiCategory
        number aiConfidence
        string aiSuggestedDepartment
        ObjectId duplicateOf FK
        boolean isDuplicate
        number similarityScore
        object resolutionEvidence
        string rejectionReason
        date createdAt
        date updatedAt
    }

    COMPLAINT_UPDATE {
        ObjectId _id PK
        ObjectId complaintId FK
        ObjectId updatedBy FK
        string previousStatus
        string newStatus
        string comment
        string evidenceImage
        date timestamp
    }
```

---

## 3. Indexes & Constraints
1. **Complaints 2dsphere Index:** `location: '2dsphere'` allows high-speed geospatial queries (`$nearSphere` and spherical distance calculations).
2. **Sequential Unique Identifier:** `complaintId` unique index (`CIV-YYYY-XXXX`).
3. **User Email:** `email` unique index (lowercased and trimmed).
4. **Foreign Key Lookups:** Indexed `citizenId`, `departmentId`, `complaintId` on `ComplaintUpdate` to achieve sub-millisecond timeline retrieval.
