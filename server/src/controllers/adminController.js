const User = require('../models/User');
const Department = require('../models/Department');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');

// GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const underReviewComplaints = await Complaint.countDocuments({ status: 'Under Review' });
    const assignedComplaints = await Complaint.countDocuments({ status: 'Assigned' });
    const submittedComplaints = await Complaint.countDocuments({ status: 'Submitted' });
    const rejectedComplaints = await Complaint.countDocuments({ status: 'Rejected' });

    const totalCitizens = await User.countDocuments({ role: 'citizen' });
    const totalStaff = await User.countDocuments({ role: 'authority' });
    const totalDepartments = await Department.countDocuments({ isActive: true });

    // High priority unresolved issues
    const highPriorityPending = await Complaint.countDocuments({
      priority: 'High',
      status: { $nin: ['Resolved', 'Rejected'] }
    });

    // Overdue complaints (created > 7 days ago and still pending)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const overdueComplaints = await Complaint.countDocuments({
      createdAt: { $lt: sevenDaysAgo },
      status: { $nin: ['Resolved', 'Rejected'] }
    });

    // Breakdown by category
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Breakdown by priority
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Breakdown by department
    const departmentStats = await Complaint.aggregate([
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$department.name', 'Unassigned'] },
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Calculate resolution rate %
    const resolutionRate = totalComplaints > 0
      ? Math.round((resolvedComplaints / totalComplaints) * 100)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        resolvedComplaints,
        inProgressComplaints,
        underReviewComplaints,
        assignedComplaints,
        submittedComplaints,
        rejectedComplaints,
        resolutionRate,
        highPriorityPending,
        overdueComplaints,
        totalCitizens,
        totalStaff,
        totalDepartments
      },
      categoryStats,
      priorityStats,
      departmentStats
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { designation: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .populate('departmentId', 'name code')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      total: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, departmentId, designation, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and role are required.'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    const passwordHash = await User.hashPassword(password);
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      departmentId: role === 'authority' ? departmentId : null,
      designation: designation || '',
      phone: phone || ''
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        designation: user.designation
      }
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, departmentId, designation, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (departmentId !== undefined) user.departmentId = departmentId || null;
    if (designation !== undefined) user.designation = designation;
    if (role && ['citizen', 'authority', 'admin'].includes(role)) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        departmentId: user.departmentId,
        designation: user.designation
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/departments
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort('name');

    // Aggregate staff and complaints per department
    const deptData = await Promise.all(
      departments.map(async (dept) => {
        const staffCount = await User.countDocuments({ departmentId: dept._id, role: 'authority' });
        const totalComplaints = await Complaint.countDocuments({ departmentId: dept._id });
        const pendingComplaints = await Complaint.countDocuments({
          departmentId: dept._id,
          status: { $nin: ['Resolved', 'Rejected'] }
        });

        return {
          ...dept.toObject(),
          staffCount,
          totalComplaints,
          pendingComplaints
        };
      })
    );

    res.status(200).json({
      success: true,
      departments: deptData
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/departments
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, supportedCategories, contactEmail, contactPhone } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required.'
      });
    }

    const dept = new Department({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      supportedCategories: Array.isArray(supportedCategories)
        ? supportedCategories
        : (supportedCategories ? supportedCategories.split(',').map(s => s.trim()) : []),
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || ''
    });

    await dept.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: dept
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate('defaultDepartmentId', 'name code').sort('name');
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, code, description, defaultDepartmentId, defaultPriority, severityBaseScore } = req.body;

    if (!name || !code || !defaultDepartmentId) {
      return res.status(400).json({
        success: false,
        message: 'Category name, code and default department are required.'
      });
    }

    const category = new Category({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      defaultDepartmentId,
      defaultPriority: defaultPriority || 'Medium',
      severityBaseScore: severityBaseScore || 5
    });

    await category.save();

    const populated = await Category.findById(category._id).populate('defaultDepartmentId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: populated
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/complaints/:id/reassign
const reassignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentId, assignedTo, priority, comment } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    const prevDept = complaint.departmentId;
    if (departmentId) complaint.departmentId = departmentId;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;
    if (priority) complaint.priority = priority;
    if (complaint.status === 'Submitted') complaint.status = 'Assigned';

    await complaint.save();

    const updateEvent = new ComplaintUpdate({
      complaintId: complaint._id,
      updatedBy: req.user._id,
      previousStatus: complaint.status,
      newStatus: complaint.status,
      comment: comment || `Complaint reassigned by municipal administrator.`
    });
    await updateEvent.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code')
      .populate('assignedTo', 'name email designation');

    res.status(200).json({
      success: true,
      message: 'Complaint reassigned successfully',
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUserStatus,
  getDepartments,
  createDepartment,
  getCategories,
  createCategory,
  reassignComplaint
};
