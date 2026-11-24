const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  createUser,
  updateUserStatus,
  getDepartments,
  createDepartment,
  getCategories,
  createCategory,
  reassignComplaint
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All admin routes require admin role
router.use(authenticateToken, authorizeRoles('admin'));

// Admin Dashboard stats
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/status', updateUserStatus);

// Department Management
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);

// Category Management
router.get('/categories', getCategories);
router.post('/categories', createCategory);

// Complaint Reassignment
router.patch('/complaints/:id/reassign', reassignComplaint);

module.exports = router;
