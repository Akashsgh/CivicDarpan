const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const Department = require('../models/Department');
const Category = require('../models/Category');
const MLClient = require('../services/mlClient');

// Helper to generate sequential Complaint ID
const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `CIV-${currentYear}-${sequence}`;
};

// POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      landmark,
      city,
      pincode
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.'
      });
    }

    // Default coordinates if not provided (Central Connaught Place, New Delhi: 77.2195, 28.6315)
    const lat = latitude ? parseFloat(latitude) : 28.6315;
    const lng = longitude ? parseFloat(longitude) : 77.2195;

    // Handle uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Call ML service for Category Prediction
    const aiPrediction = await MLClient.predictCategory(description);

    // Selected category: citizen's explicit choice if valid, or AI suggested category
    const finalCategory = category && category.trim() !== '' ? category.trim() : aiPrediction.category;

    // Resolve Department
    let department = null;
    const matchedCategory = await Category.findOne({ name: finalCategory }).populate('defaultDepartmentId');
    if (matchedCategory && matchedCategory.defaultDepartmentId) {
      department = matchedCategory.defaultDepartmentId;
    } else {
      // Fallback by department name search
      department = await Department.findOne({
        $or: [
          { name: new RegExp(aiPrediction.suggested_department || '', 'i') },
          { supportedCategories: finalCategory }
        ]
      });
      if (!department) {
        department = await Department.findOne(); // first available department
      }
    }

    // Find nearby complaints within ~1.5 km to check for duplicates
    // 1.5 km in radians: 1.5 / 6378.1
    const maxDistanceMeters = 1500;
    const recentCandidates = await Complaint.find({
      status: { $nin: ['Resolved', 'Rejected'] },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistanceMeters
        }
      }
    }).select('complaintId title description category location createdAt').limit(10).lean();

    // Call ML Duplicate Detection
    const duplicateCheck = await MLClient.detectDuplicates(
      description,
      [lng, lat],
      recentCandidates.map(c => ({
        id: c._id.toString(),
        complaintId: c.complaintId,
        title: c.title,
        description: c.description,
        coordinates: c.location.coordinates,
        created_at: c.createdAt
      }))
    );

    // Call ML Priority Calculation
    const priorityResult = await MLClient.calculatePriority({
      description,
      category: finalCategory,
      report_count: duplicateCheck.is_duplicate ? 2 : 1,
      days_pending: 0,
      is_repeat: duplicateCheck.is_duplicate
    });

    const complaintId = await generateComplaintId();

    const newComplaint = new Complaint({
      complaintId,
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      imageUrl,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || '',
        landmark: landmark || '',
        city: city || 'New Delhi',
        pincode: pincode || ''
      },
      citizenId: req.user._id,
      departmentId: department ? department._id : null,
      status: 'Submitted',
      priority: priorityResult.priority || 'Medium',
      priorityScore: priorityResult.score || 50,
      priorityReason: priorityResult.explanation || 'Evaluated based on issue severity and civic density',
      aiCategory: aiPrediction.category,
      aiConfidence: aiPrediction.confidence,
      aiSuggestedDepartment: aiPrediction.suggested_department,
      duplicateOf: duplicateCheck.is_duplicate && duplicateCheck.duplicate_of_id ? duplicateCheck.duplicate_of_id : null,
      isDuplicate: duplicateCheck.is_duplicate || false,
      similarityScore: duplicateCheck.similarity_score || 0
    });

    await newComplaint.save();

    // Add initial status history event
    const initialUpdate = new ComplaintUpdate({
      complaintId: newComplaint._id,
      updatedBy: req.user._id,
      previousStatus: 'None',
      newStatus: 'Submitted',
      comment: 'Complaint registered by citizen and logged in municipal database.'
    });
    await initialUpdate.save();

    const populatedComplaint = await Complaint.findById(newComplaint._id)
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code')
      .populate('duplicateOf', 'complaintId title status');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: populatedComplaint,
      duplicateAlert: duplicateCheck.is_duplicate ? {
        message: 'A similar civic issue was recently reported in this vicinity.',
        matchedComplaintId: duplicateCheck.matched_complaint_id,
        similarityScore: duplicateCheck.similarity_score
      } : null
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints
const getComplaints = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      departmentId,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // Role-based Access Control
    if (req.user.role === 'citizen') {
      query.citizenId = req.user._id;
    } else if (req.user.role === 'authority') {
      // Authority staff sees their department's complaints
      if (req.user.departmentId) {
        query.departmentId = req.user.departmentId;
      }
    }
    // Admin sees all complaints (no role filter)

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (departmentId && departmentId !== 'all') {
      query.departmentId = departmentId;
    }

    if (search) {
      query.$or = [
        { complaintId: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code')
      .populate('assignedTo', 'name email designation')
      .populate('duplicateOf', 'complaintId title')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      complaints
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints/:id
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let complaint;
    if (id.startsWith('CIV-')) {
      complaint = await Complaint.findOne({ complaintId: id });
    } else {
      complaint = await Complaint.findById(id);
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Check citizen permission
    if (req.user.role === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Citizens may only view their own reported complaints.'
      });
    }

    const populated = await Complaint.findById(complaint._id)
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code contactEmail contactPhone')
      .populate('assignedTo', 'name email designation phone')
      .populate('duplicateOf', 'complaintId title status createdAt');

    // Fetch timeline updates
    const updates = await ComplaintUpdate.find({ complaintId: complaint._id })
      .populate('updatedBy', 'name role designation')
      .sort('timestamp');

    res.status(200).json({
      success: true,
      complaint: populated,
      timeline: updates
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/complaints/:id
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      departmentId,
      assignedTo,
      comment,
      rejectionReason
    } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Role validation: Citizens cannot update complaint status
    if (req.user.role === 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Citizens cannot change complaint workflow status.'
      });
    }

    const previousStatus = complaint.status;
    let statusChanged = false;

    if (status && status !== complaint.status) {
      complaint.status = status;
      statusChanged = true;
    }

    if (priority) {
      complaint.priority = priority;
    }

    if (departmentId) {
      complaint.departmentId = departmentId;
    }

    if (assignedTo !== undefined) {
      complaint.assignedTo = assignedTo || null;
    }

    if (rejectionReason && status === 'Rejected') {
      complaint.rejectionReason = rejectionReason;
    }

    // Handle Resolution Evidence photo upload
    let evidenceImage = null;
    if (req.file) {
      evidenceImage = `/uploads/${req.file.filename}`;
    }

    if (status === 'Resolved') {
      complaint.resolutionEvidence = {
        imageUrl: evidenceImage || complaint.resolutionEvidence?.imageUrl,
        comment: comment || 'Issue inspected, repaired and verified by municipal staff.',
        resolvedAt: new Date(),
        resolvedBy: req.user._id
      };
    }

    await complaint.save();

    // Log update audit event
    const updateEvent = new ComplaintUpdate({
      complaintId: complaint._id,
      updatedBy: req.user._id,
      previousStatus: previousStatus,
      newStatus: complaint.status,
      comment: comment || `Status updated from ${previousStatus} to ${complaint.status}.`,
      evidenceImage: evidenceImage
    });
    await updateEvent.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code')
      .populate('assignedTo', 'name email designation')
      .populate('resolutionEvidence.resolvedBy', 'name designation');

    res.status(200).json({
      success: true,
      message: `Complaint updated to '${complaint.status}'`,
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/:id/updates (Add comment or status note)
const addComplaintUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment, newStatus } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    let evidenceImage = null;
    if (req.file) {
      evidenceImage = `/uploads/${req.file.filename}`;
    }

    const previousStatus = complaint.status;
    const updatedStatus = newStatus || complaint.status;

    if (newStatus && newStatus !== complaint.status) {
      complaint.status = newStatus;
      await complaint.save();
    }

    const update = new ComplaintUpdate({
      complaintId: complaint._id,
      updatedBy: req.user._id,
      previousStatus,
      newStatus: updatedStatus,
      comment: comment || 'Progress note added.',
      evidenceImage
    });
    await update.save();

    res.status(201).json({
      success: true,
      message: 'Status update logged successfully',
      update
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/test-ai-prediction (Interactive AI test endpoint for the submit form)
const testAIPrediction = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Text must be at least 5 characters for AI categorization.'
      });
    }

    const prediction = await MLClient.predictCategory(text);
    res.status(200).json({
      success: true,
      prediction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  addComplaintUpdate,
  testAIPrediction
};
