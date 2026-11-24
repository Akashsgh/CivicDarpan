const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  addComplaintUpdate,
  testAIPrediction
} = require('../controllers/complaintController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Interactive AI prediction test (authenticated or public for previewing)
router.post('/test-ai-prediction', authenticateToken, testAIPrediction);

// Submit complaint (citizen)
router.post('/', authenticateToken, upload.single('image'), createComplaint);

// List complaints (role filtered)
router.get('/', authenticateToken, getComplaints);

// Get single complaint details & timeline
router.get('/:id', authenticateToken, getComplaintById);

// Update status / assign (authority or admin)
router.patch('/:id', authenticateToken, authorizeRoles('authority', 'admin'), upload.single('evidenceImage'), updateComplaint);

// Add progress update / comment
router.post('/:id/updates', authenticateToken, authorizeRoles('authority', 'admin'), upload.single('evidenceImage'), addComplaintUpdate);

module.exports = router;
