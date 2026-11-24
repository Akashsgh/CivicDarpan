# 04. System Architecture

## 1. High-Level Architecture
CivicLens follows a decoupled, three-tier microservice architecture consisting of:
1. **Client Presentation Tier (SPA):** Built with React.js 18, Vite, Tailwind CSS, Leaflet for OpenStreetMap rendering, and Recharts for data analytics.
2. **Application & Business Logic Tier:** Built with Node.js and Express.js, providing RESTful endpoints, JWT authentication, file storage via Multer, and data models via Mongoose.
3. **Database Tier:** MongoDB Atlas or local MongoDB instance, featuring GeoJSON 2dsphere indexing for high-speed spatial proximity queries.
4. **AI / ML Microservice Tier:** Built with Python 3.14 and FastAPI, serving Scikit-learn classification pipelines, TF-IDF vectorizers, and geospatial duplicate detection logic over HTTP.

---

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client Tier (Browser / React SPA)"]
        UI["React 18 + Vite SPA"]
        Leaflet["Leaflet OpenStreetMap"]
        Recharts["Recharts Analytics"]
        AuthCtx["Auth Context & Axios"]
    end

    subgraph Backend ["Backend Tier (Node.js / Express.js)"]
        API["Express REST API (Port 5000)"]
        AuthMW["JWT & RBAC Middleware"]
        Multer["Multer Storage (/uploads)"]
        Controllers["Controllers (MVC)"]
        MLClient["ML HTTP Client Service"]
    end

    subgraph MLService ["AI / ML Microservice (Python / FastAPI)"]
        FastAPI["FastAPI App (Port 8000)"]
        Model["Trained TF-IDF + LogisticRegression"]
        DupEngine["Cosine Similarity + Haversine Engine"]
        PriorityEngine["Explainable Priority Scorer"]
    end

    subgraph Database ["Data Tier (MongoDB)"]
        Mongo[("MongoDB (Port 27017)")]
        UsersCol[("Users Collection")]
        ComplaintsCol[("Complaints Collection (2dsphere)")]
        DeptsCol[("Departments Collection")]
        UpdatesCol[("ComplaintUpdates Audit Trail")]
    end

    UI -->|HTTPS / JSON| API
    API --> AuthMW
    AuthMW --> Controllers
    Controllers --> Multer
    Controllers -->|HTTP JSON Requests| MLClient
    MLClient -->|POST /predict, /detect, /priority| FastAPI
    FastAPI --> Model
    FastAPI --> DupEngine
    FastAPI --> PriorityEngine
    Controllers -->|Mongoose Queries| Mongo
    Mongo --> UsersCol
    Mongo --> ComplaintsCol
    Mongo --> DeptsCol
    Mongo --> UpdatesCol
```

---

## 3. Communication Protocols
- **Client to Backend:** HTTP REST / JSON over port 5000 with Bearer JWT tokens in the `Authorization` header.
- **Backend to ML Service:** Inter-service HTTP REST over port 8000 (`http://127.0.0.1:8000`) with JSON payloads.
- **Backend to Database:** TCP via Mongoose connection pool (`mongodb://127.0.0.1:27017/civiclens`).
