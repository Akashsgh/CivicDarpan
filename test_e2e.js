const BASE_URL = 'http://127.0.0.1:5000/api';

async function req(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('      CIVICLENS END-TO-END INTEGRATION TEST SUITE    ');
  console.log('====================================================');

  try {
    // 1. Health Check
    console.log('\n[1] Testing Backend Health...');
    const healthRes = await req(`${BASE_URL}/health`);
    console.log('    Status:', healthRes.status, '| Service:', healthRes.service);

    // 2. Citizen Login
    console.log('\n[2] Testing Citizen Authentication...');
    const citizenLogin = await req(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'citizen@example.com',
        password: 'Citizen@123'
      })
    });
    const citizenToken = citizenLogin.token;
    console.log('    Citizen Logged In:', citizenLogin.user.name, `(${citizenLogin.user.role})`);

    // 3. AI Category Prediction via Express -> FastAPI
    console.log('\n[3] Testing Interactive AI Category Prediction...');
    const aiRes = await req(`${BASE_URL}/complaints/test-ai-prediction`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({
        text: 'Water is continuously leaking from a pipe under the road causing localized flooding'
      })
    });
    console.log('    AI Predicted Category:', aiRes.prediction.category);
    console.log('    AI Confidence:', (aiRes.prediction.confidence * 100).toFixed(1) + '%');
    console.log('    AI Suggested Dept:', aiRes.prediction.suggested_department);

    // 4. Submit Complaint
    console.log('\n[4] Testing Citizen Complaint Submission with GPS & AI...');
    const newCompRes = await req(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({
        title: 'Dangerous deep pothole on Kasturba Gandhi Marg',
        description: 'Large asphalt crater right before the pedestrian crossing causing severe vehicle swerving and near accidents.',
        category: 'Potholes & Damaged Roads',
        latitude: 28.6275,
        longitude: 77.2215,
        address: 'KG Marg, Near British Council',
        landmark: 'Near Tolstoy Circle',
        city: 'New Delhi',
        pincode: '110001'
      })
    });
    const created = newCompRes.complaint;
    console.log('    Created Complaint ID:', created.complaintId);
    console.log('    Assigned Priority:', created.priority, `(Score: ${created.priorityScore}/100)`);
    console.log('    Priority Reason:', created.priorityReason);
    console.log('    Department Routed:', created.departmentId?.name);

    // 5. Test Duplicate Detection by Submitting Similar Complaint in Same Vicinity
    console.log('\n[5] Testing AI Duplicate Detection Engine...');
    const dupCompRes = await req(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({
        title: 'Deep pothole crater on KG Marg',
        description: 'Large dangerous crater on KG marg road near pedestrian crossing. Vehicles are swerving abruptly.',
        category: 'Potholes & Damaged Roads',
        latitude: 28.6276, // 15 meters away
        longitude: 77.2216,
        address: 'KG Marg',
        city: 'New Delhi'
      })
    });
    const dupCreated = dupCompRes.complaint;
    console.log('    Second Complaint ID:', dupCreated.complaintId);
    console.log('    Is Flagged Duplicate:', dupCreated.isDuplicate);
    if (dupCreated.isDuplicate) {
      console.log('    Duplicate Of:', dupCreated.duplicateOf?.complaintId || dupCreated.duplicateOf);
      console.log('    Similarity Score:', (dupCreated.similarityScore * 100).toFixed(1) + '%');
    }

    // 6. Authority Staff Login
    console.log('\n[6] Testing Authority Staff Authentication & Workflow...');
    const staffLogin = await req(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'officer.roads@civiclens.gov.in',
        password: 'Staff@123'
      })
    });
    const staffToken = staffLogin.token;
    console.log('    Staff Logged In:', staffLogin.user.name, `(${staffLogin.user.role})`);

    // 7. Update Status to In Progress
    console.log('\n[7] Updating Status to In Progress...');
    const progressRes = await req(`${BASE_URL}/complaints/${created._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        status: 'In Progress',
        comment: 'Roads repair team dispatched with cold asphalt premix truck.'
      })
    });
    console.log('    Updated Status:', progressRes.complaint.status);

    // 8. Resolve Complaint with Evidence
    console.log('\n[8] Resolving Complaint with Resolution Evidence...');
    const resolvedRes = await req(`${BASE_URL}/complaints/${created._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        status: 'Resolved',
        comment: 'Crater patched with asphalt compaction, leveled and road reopened to traffic.'
      })
    });
    console.log('    Final Status:', resolvedRes.complaint.status);
    console.log('    Resolution Evidence Recorded:', resolvedRes.complaint.resolutionEvidence.comment);

    // 9. Verify Citizen Can Inspect Audit History
    console.log('\n[9] Inspecting Full Audit Timeline Trail...');
    const detailsRes = await req(`${BASE_URL}/complaints/${created.complaintId}`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log('    Timeline Events Count:', detailsRes.timeline.length);
    detailsRes.timeline.forEach((t, i) => {
      console.log(`      Step ${i + 1}: ${t.previousStatus} -> ${t.newStatus} (${t.comment.slice(0, 45)}...)`);
    });

    // 10. Admin Analytics & Hotspot Verification
    console.log('\n[10] Testing Admin Hotspot Analysis & Municipal Stats...');
    const adminLogin = await req(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@civiclens.gov.in',
        password: 'Admin@123'
      })
    });
    const adminToken = adminLogin.token;

    const statsRes = await req(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('    Admin Total Complaints:', statsRes.stats.totalComplaints);
    console.log('    Resolution Rate:', statsRes.stats.resolutionRate + '%');

    const hotspotRes = await req(`${BASE_URL}/analytics/hotspots`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('    Identified Hotspot Clusters:', hotspotRes.hotspotCount);
    if (hotspotRes.hotspots.length > 0) {
      console.log('    Top Hotspot Zone:', hotspotRes.hotspots[0].zoneName, `(${hotspotRes.hotspots[0].count} issues)`);
    }

    console.log('\n====================================================');
    console.log('    ALL 10 END-TO-END VERIFICATION TESTS PASSED!    ');
    console.log('====================================================');
    process.exit(0);

  } catch (err) {
    console.error('\n[TEST FAILURE]:', err.message);
    process.exit(1);
  }
}

runE2ETests();
