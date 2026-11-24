import os
import math
import joblib
import numpy as np
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize FastAPI app
app = FastAPI(
    title="CivicLens ML Service",
    description="Explainable AI/ML Service for Civic Issue Categorization, Duplicate Detection, and Priority Scoring",
    version="1.0.0"
)

# Enable CORS for Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained classification model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'civic_classifier.joblib')
model_data = None

try:
    if os.path.exists(MODEL_PATH):
        model_data = joblib.load(MODEL_PATH)
        print(f"[ML Service] Successfully loaded model from {MODEL_PATH}")
    else:
        print(f"[ML Service] Warning: Model file not found at {MODEL_PATH}. Please run train.py first.")
except Exception as e:
    print(f"[ML Service] Error loading model: {e}")

# Pydantic Request & Response Schemas
class PredictRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Complaint description text")

class CandidateComplaint(BaseModel):
    id: str
    complaintId: str
    title: Optional[str] = ""
    description: str
    coordinates: Optional[List[float]] = None # [lng, lat]
    created_at: Optional[Any] = None

class DuplicateCheckRequest(BaseModel):
    description: str
    coordinates: Optional[List[float]] = None # [lng, lat]
    candidates: List[CandidateComplaint] = []

class PriorityScoreRequest(BaseModel):
    description: str
    category: Optional[str] = "General Civic"
    report_count: Optional[int] = 1
    days_pending: Optional[int] = 0
    is_repeat: Optional[bool] = False

# Haversine distance helper (in meters)
def haversine_distance(coord1: List[float], coord2: List[float]) -> float:
    """
    Computes great-circle distance between two [lng, lat] points in meters.
    coord: [longitude, latitude]
    """
    lng1, lat1 = coord1[0], coord1[1]
    lng2, lat2 = coord2[0], coord2[1]
    
    R = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    return round(R * c, 1)

# Health endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CivicLens ML Service",
        "model_loaded": model_data is not None,
        "algorithm": model_data.get('algorithm') if model_data else "None"
    }

# Feature 1: AI Complaint Classification
@app.post("/predict-category")
def predict_category(req: PredictRequest):
    if not model_data or 'pipeline' not in model_data:
        raise HTTPException(status_code=503, detail="Classification model is not loaded. Please train the model.")
    
    pipeline = model_data['pipeline']
    cat_to_dept = model_data.get('cat_to_dept', {})
    classes = model_data.get('categories', list(pipeline.classes_))
    
    text = req.text.strip()
    
    try:
        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba([text])[0]
            top_idx = int(np.argmax(probs))
            top_cat = classes[top_idx]
            confidence = round(float(probs[top_idx]), 4)
            prob_dict = {classes[i]: round(float(probs[i]), 4) for i in range(len(classes))}
        else:
            top_cat = pipeline.predict([text])[0]
            confidence = 0.85
            prob_dict = {top_cat: 1.0}
            
        suggested_dept = cat_to_dept.get(top_cat, "Municipal Administration")
        
        return {
            "category": top_cat,
            "confidence": confidence,
            "suggested_department": suggested_dept,
            "all_probabilities": prob_dict,
            "low_confidence_flag": confidence < 0.40
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

# Feature 2: Duplicate Complaint Detection
@app.post("/detect-duplicates")
def detect_duplicates(req: DuplicateCheckRequest):
    if not req.candidates:
        return {
            "is_duplicate": False,
            "matched_complaint_id": None,
            "duplicate_of_id": None,
            "similarity_score": 0.0,
            "distance_meters": None,
            "explanation": "No existing complaints in the surrounding vicinity to compare against."
        }
        
    descriptions = [c.description for c in req.candidates]
    all_texts = [req.description] + descriptions
    
    # Compute TF-IDF matrix and Cosine Similarity
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Cosine similarity of candidate (row 0) with all candidates (rows 1..N)
    sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    best_candidate_idx = None
    best_sim_score = -1.0
    best_distance = None
    is_duplicate = False
    best_reason = ""
    
    for i, candidate in enumerate(req.candidates):
        sim = float(sim_scores[i])
        
        # Calculate geographical distance if coordinates are present
        dist = None
        if req.coordinates and candidate.coordinates and len(req.coordinates) == 2 and len(candidate.coordinates) == 2:
            try:
                dist = haversine_distance(req.coordinates, candidate.coordinates)
            except Exception:
                dist = None
                
        candidate_is_dup = False
        reason = ""
        
        # Multi-factor duplicate criteria:
        # 1. Immediate spatial proximity (within 150m) with related civic vocabulary
        if dist is not None and dist <= 150 and sim >= 0.15:
            candidate_is_dup = True
            reason = f"Within immediate spot proximity ({dist:.0f}m) with matching issue description ({sim*100:.1f}% text similarity)."
        # 2. Local proximity (within 500m) with moderate text similarity
        elif dist is not None and dist <= 500 and sim >= 0.35:
            candidate_is_dup = True
            reason = f"Located within {dist:.0f}m radius with moderate text similarity ({sim*100:.1f}%)."
        # 3. Neighborhood proximity (within 1200m) with high text similarity
        elif dist is not None and dist <= 1200 and sim >= 0.60:
            candidate_is_dup = True
            reason = f"High text similarity ({sim*100:.1f}%) within {dist:.0f}m neighborhood zone."
        # 4. Pure textual match (near identical wording)
        elif sim >= 0.75:
            dist_str = f"at {dist:.0f}m distance" if dist is not None else "location pending"
            candidate_is_dup = True
            reason = f"High textual duplication ({sim*100:.1f}%) {dist_str}."
            
        if sim > best_sim_score or (candidate_is_dup and not is_duplicate):
            best_sim_score = sim
            best_candidate_idx = i
            best_distance = dist
            if candidate_is_dup:
                is_duplicate = True
                best_reason = reason
                
    if best_candidate_idx is not None and is_duplicate:
        matched = req.candidates[best_candidate_idx]
        explanation = (
            f"Potential duplicate of {matched.complaintId}: {best_reason} "
            f"Flagged for municipal staff confirmation."
        )
        return {
            "is_duplicate": True,
            "matched_complaint_id": matched.complaintId,
            "duplicate_of_id": matched.id,
            "similarity_score": round(best_sim_score, 4),
            "distance_meters": best_distance,
            "explanation": explanation
        }
    else:
        return {
            "is_duplicate": False,
            "matched_complaint_id": None,
            "duplicate_of_id": None,
            "similarity_score": round(best_sim_score, 4) if best_sim_score > 0 else 0.0,
            "distance_meters": best_distance,
            "explanation": "No duplicate pattern detected in surrounding area."
        }

# Feature 3: Smart Priority Recommendation
@app.post("/priority-score")
def calculate_priority(req: PriorityScoreRequest):
    text = req.description.lower()
    score = 50
    reasons = []
    
    # Critical public safety / emergency hazard keywords
    high_hazard_words = [
        'accident', 'death', 'injury', 'bleed', 'fire', 'spark', 'electric',
        'live wire', 'open manhole', 'flood', 'submerged', 'hospital',
        'school', 'children', 'elderly', 'ambulance', 'sinkhole', 'collapse'
    ]
    detected_hazards = [w for w in high_hazard_words if w in text]
    if detected_hazards:
        score += 35
        reasons.append(f"Emergency safety keywords detected: {', '.join(detected_hazards[:3])}")
        
    # Inherent category severity baseline
    high_impact_categories = [
        'Broken Streetlights & Electrical',
        'Blocked Drainage & Waterlogging',
        'Potholes & Damaged Roads'
    ]
    if req.category in high_impact_categories:
        score += 12
        reasons.append(f"Core municipal category '{req.category}' carries elevated baseline impact")
        
    # Multiple reports / duplicate escalation
    if req.report_count and req.report_count > 1:
        repeat_boost = min(25, (req.report_count - 1) * 10)
        score += repeat_boost
        reasons.append(f"Escalated due to {req.report_count} clustered citizen reports in same zone")
        
    # Aging factor (days pending without resolution)
    if req.days_pending and req.days_pending > 0:
        aging_boost = min(20, req.days_pending * 3)
        score += aging_boost
        reasons.append(f"SLA aging factor: unresolved for {req.days_pending} days")
        
    # Cap score
    score = max(10, min(100, score))
    
    # Priority tiers
    if score >= 70:
        priority = "High"
    elif score >= 42:
        priority = "Medium"
    else:
        priority = "Low"
        
    explanation = ". ".join(reasons) if reasons else "Standard municipal priority based on baseline evaluation."
    
    return {
        "priority": priority,
        "score": score,
        "explanation": explanation
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
