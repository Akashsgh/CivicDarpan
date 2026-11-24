# 11. Installation & Execution Guide

This guide enables any student or evaluation panel to run the complete CivicLens application locally on Windows, macOS, or Linux.

---

## 1. Prerequisites
- **Node.js:** v18+ (tested on Node.js v24.11.0)
- **Python:** v3.10+ (tested on Python 3.14.0)
- **MongoDB:** MongoDB Community Server (v6.0+) running locally on default port `27017`, OR a free MongoDB Atlas cloud connection URI.

---

## 2. Quick Setup in 4 Steps

### Step 1: Install Python ML Dependencies
Open a terminal in the project root:
```bash
cd ml-service
pip install -r requirements.txt
python train.py
```
*This trains the Scikit-learn TF-IDF classifier on the civic complaints dataset and saves the pipeline to `ml-service/models/civic_classifier.joblib`.*

---

### Step 2: Install Server Dependencies & Seed Database
In a new terminal:
```bash
cd server
npm install
npm run seed
```
*This connects to MongoDB, creates all municipal departments, categories, and initial demo accounts, and populates 10 realistic geo-tagged complaints with full history.*

---

### Step 3: Install Client Dependencies
In a new terminal:
```bash
cd client
npm install
npm run build
```

---

### Step 4: Run the Application Services

Start the 3 microservices in separate terminal windows:

#### Terminal 1: Python FastAPI ML Service
```bash
cd ml-service
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```
*(Runs on `http://127.0.0.1:8000`)*

#### Terminal 2: Node.js Express Backend
```bash
cd server
node server.js
```
*(Runs on `http://127.0.0.1:5000`)*

#### Terminal 3: React Vite Frontend
```bash
cd client
npm run dev
```
*(Open browser at `http://localhost:5173`)*

---

## 3. Demo Credentials for Evaluation

The database is pre-seeded with accounts for all roles:

| Role | Email | Password | Scope & Description |
|---|---|---|---|
| **Administrator** | `admin@civiclens.gov.in` | `Admin@123` | Master municipal console, Hotspot Analytics, Manage Users/Depts |
| **Authority Staff (Roads)** | `officer.roads@civiclens.gov.in` | `Staff@123` | Executive Engineer - PWD Roads |
| **Authority Staff (Sanitation)** | `officer.sanitation@civiclens.gov.in` | `Staff@123` | Chief Sanitary Inspector |
| **Authority Staff (Water)** | `officer.water@civiclens.gov.in` | `Staff@123` | Zonal Water Maintenance Lead |
| **Citizen (Aarav)** | `citizen@example.com` | `Citizen@123` | Citizen portal, report issue, track status |
| **Citizen (Priya)** | `priya.sharma@example.com` | `Citizen@123` | Citizen portal, second test account |

*(Tip: The login page includes 1-click quick-fill buttons for all these accounts!)*

---

## 4. Running the Automated Test Suite

To verify the complete system with a single command:
```bash
node test_e2e.js
```
Expected output: `ALL 10 END-TO-END VERIFICATION TESTS PASSED!`
