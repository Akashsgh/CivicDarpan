import sys
from app import app, predict_category, detect_duplicates, calculate_priority, PredictRequest, DuplicateCheckRequest, CandidateComplaint, PriorityScoreRequest

def run_tests():
    print("=== Testing CivicLens ML Algorithms ===")
    
    # 1. Test Prediction
    sample1 = "Water is continuously leaking from a pipe near the main road causing flooding"
    res1 = predict_category(PredictRequest(text=sample1))
    print("\n[Test 1] Category Prediction:")
    print(f"  Input: \"{sample1}\"")
    print(f"  Predicted Category: {res1['category']}")
    print(f"  Confidence: {res1['confidence'] * 100:.2f}%")
    print(f"  Suggested Department: {res1['suggested_department']}")
    assert "Water" in res1['category'] or "Pipeline" in res1['category'], "Water prediction failed"
    print("  => Test 1 Passed!")

    # 2. Test Duplicate Detection
    new_desc = "Massive water pipe leakage flooding Janpath road"
    candidate = CandidateComplaint(
        id="comp123",
        complaintId="CIV-2026-0004",
        title="Pipe burst on Janpath",
        description="High pressure drinking water pipe burst under the pavement. Potable water is flooding the street",
        coordinates=[77.2198, 28.6295]
    )
    dup_req = DuplicateCheckRequest(
        description=new_desc,
        coordinates=[77.2201, 28.6300], # ~70m away
        candidates=[candidate]
    )
    res2 = detect_duplicates(dup_req)
    print("\n[Test 2] Duplicate Detection:")
    print(f"  Is Duplicate: {res2['is_duplicate']}")
    print(f"  Matched Complaint: {res2['matched_complaint_id']}")
    print(f"  Similarity Score: {res2['similarity_score'] * 100:.1f}%")
    print(f"  Distance: {res2['distance_meters']}m")
    print(f"  Explanation: {res2['explanation']}")
    assert res2['is_duplicate'] is True, "Duplicate detection failed"
    print("  => Test 2 Passed!")

    # 3. Test Priority Score
    p_req = PriorityScoreRequest(
        description="Open live wire sparking near school gate with high risk of electrocution and children accident",
        category="Broken Streetlights & Electrical",
        report_count=3,
        days_pending=2
    )
    res3 = calculate_priority(p_req)
    print("\n[Test 3] Priority Scoring:")
    print(f"  Calculated Priority: {res3['priority']}")
    print(f"  Score: {res3['score']}/100")
    print(f"  Explanation: {res3['explanation']}")
    assert res3['priority'] == "High", "Expected High priority for emergency live wire"
    print("  => Test 3 Passed!")

    print("\n=== ALL ML ALGORITHM TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_tests()
