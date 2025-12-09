const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getConversionAnalytics,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllConversions,
  deleteConversion,
  getSystemHealth
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// All routes are protected and require admin role
router.use(protect);
router.use(isAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Analytics
router.get('/analytics/conversions', getConversionAnalytics);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Conversions management
router.get('/conversions', getAllConversions);
router.delete('/conversions/:id', deleteConversion);

// System health
router.get('/health', getSystemHealth);

module.exports = router;