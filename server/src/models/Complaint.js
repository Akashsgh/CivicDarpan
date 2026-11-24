const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  landmark: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: 'Delhi NCR'
  },
  pincode: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  location: {
    type: pointSchema,
    required: true,
    index: '2dsphere'
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null,
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Submitted',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
    index: true
  },
  priorityScore: {
    type: Number,
    default: 50
  },
  priorityReason: {
    type: String,
    default: 'Standard municipal turnaround evaluation'
  },
  aiCategory: {
    type: String,
    default: null
  },
  aiConfidence: {
    type: Number,
    default: null
  },
  aiSuggestedDepartment: {
    type: String,
    default: null
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  similarityScore: {
    type: Number,
    default: 0
  },
  resolutionEvidence: {
    imageUrl: { type: String, default: null },
    comment: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  rejectionReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp hook
complaintSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
