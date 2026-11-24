# 08. REST API Specification

All endpoints are prefixed with `/api` unless otherwise noted. Authentication is passed via HTTP Header: `Authorization: Bearer <jwt_token>`.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new user.
- **Request Body (JSON):**
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "password": "Password@123",
    "role": "citizen",
    "phone": "+91-9876543210"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "name": "...", "email": "...", "role": "citizen" }
  }
  ```

### `POST /api/auth/login`
Authenticates user and returns JWT.
- **Request Body (JSON):** `{ "email": "citizen@example.com", "password": "Citizen@123" }`
- **Response (200 OK):** `{ "success": true, "token": "...", "user": { ... } }`

### `GET /api/auth/me`
Retrieves current profile and populated department details. Requires JWT.

---

## 2. Complaint Endpoints

### `POST /api/complaints`
Registers a civic complaint with optional photo upload.
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `title`: String (required)
  - `description`: String (required)
  - `category`: String (optional, AI suggested if omitted)
  - `latitude`: Number
  - `longitude`: Number
  - `address`: String
  - `landmark`: String
  - `city`: String
  - `image`: File (optional, max 5MB)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "complaint": {
      "complaintId": "CIV-2026-0011",
      "title": "Dangerous deep pothole on KG Marg",
      "status": "Submitted",
      "priority": "High",
      "priorityScore": 97,
      "priorityReason": "Emergency safety keywords detected: accident...",
      "aiConfidence": 0.94,
      "isDuplicate": false
    },
    "duplicateAlert": null
  }
  ```

### `GET /api/complaints`
Lists complaints filtered by caller role (`citizen` only sees own; `authority` sees assigned department; `admin` sees all).
- **Query Params:** `status`, `priority`, `category`, `search`, `page`, `limit`.

### `GET /api/complaints/:id`
Retrieves complaint details and chronological audit timeline (`ComplaintUpdate` records).

### `PATCH /api/complaints/:id`
Updates complaint status and workflow. Requires `authority` or `admin` role.
- **Form Fields:** `status`, `priority`, `comment`, `evidenceImage` (file), `rejectionReason`.

### `POST /api/complaints/test-ai-prediction`
Interactive AI preview endpoint for the citizen submission form.
- **Request Body:** `{ "text": "Water continuously leaking from pipe..." }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "prediction": {
      "category": "Water Leakage & Pipeline Issues",
      "confidence": 0.556,
      "suggested_department": "Water Supply & Pipeline Division"
    }
  }
  ```

---

## 3. Administration & Analytics Endpoints

### `GET /api/admin/dashboard`
Returns total complaints, resolution rate %, status distribution, priority breakdown, and category stats.

### `GET /api/admin/users`
Lists user directory with role and status filters.

### `GET /api/admin/departments` / `POST /api/admin/departments`
Lists and creates municipal departments.

### `GET /api/analytics/hotspots`
Computes spatial clustering of complaints within ~500m grid cells.
- **Query Params:** `category`, `status`, `priority`, `days`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "totalComplaints": 12,
    "hotspotCount": 9,
    "hotspots": [
      {
        "id": "12870_4772",
        "center": [28.6315, 77.2185],
        "count": 2,
        "severityLevel": "Medium",
        "zoneName": "Opposite Plaza Cinema",
        "topCategory": "Potholes & Damaged Roads"
      }
    ]
  }
  ```

---

## 4. Python FastAPI ML Endpoints (Port 8000)

- `GET /health`: Health and model loading status.
- `POST /predict-category`: `{ "text": "..." }` $\rightarrow$ `{ category, confidence, suggested_department }`
- `POST /detect-duplicates`: `{ "description": "...", "coordinates": [lng, lat], "candidates": [...] }` $\rightarrow$ `{ is_duplicate, matched_complaint_id, similarity_score, distance_meters, explanation }`
- `POST /priority-score`: `{ description, category, report_count, days_pending }` $\rightarrow$ `{ priority, score, explanation }`
