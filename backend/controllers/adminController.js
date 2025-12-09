const User = require('../models/User');
const ConversionHistory = require('../models/ConversionHistory');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);
    
    const thisMonth = new Date(today);
    thisMonth.setMonth(today.getMonth() - 1);

    // Total users
    const totalUsers = await User.countDocuments();
    const freeUsers = await User.countDocuments({ plan: 'free' });
    const premiumUsers = await User.countDocuments({ plan: 'premium' });
    
    // New users today
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Total conversions
    const totalConversions = await ConversionHistory.countDocuments();
    const completedConversions = await ConversionHistory.countDocuments({ status: 'completed' });
    const failedConversions = await ConversionHistory.countDocuments({ status: 'failed' });
    
    // Conversions today
    const conversionsToday = await ConversionHistory.countDocuments({
      createdAt: { $gte: today }
    });

    // Conversions this week
    const conversionsThisWeek = await ConversionHistory.countDocuments({
      createdAt: { $gte: thisWeek }
    });

    // Conversions this month
    const conversionsThisMonth = await ConversionHistory.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    // Success rate
    const successRate = totalConversions > 0 
      ? ((completedConversions / totalConversions) * 100).toFixed(2)
      : 0;

    // Average processing time
    const avgProcessingTime = await ConversionHistory.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$processingTime' }
        }
      }
    ]);

    // Total storage used (in bytes)
    const storageStats = await ConversionHistory.aggregate([
      {
        $group: {
          _id: null,
          totalOriginal: { $sum: '$originalFileSize' },
          totalConverted: { $sum: '$convertedFileSize' }
        }
      }
    ]);

    // Revenue calculation (if using Stripe)
    const revenue = premiumUsers * 9.99; // $9.99 per premium user

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          free: freeUsers,
          premium: premiumUsers,
          newToday: newUsersToday
        },
        conversions: {
          total: totalConversions,
          completed: completedConversions,
          failed: failedConversions,
          today: conversionsToday,
          thisWeek: conversionsThisWeek,
          thisMonth: conversionsThisMonth,
          successRate: parseFloat(successRate)
        },
        performance: {
          avgProcessingTime: avgProcessingTime[0]?.avgTime || 0,
        },
        storage: {
          totalOriginal: storageStats[0]?.totalOriginal || 0,
          totalConverted: storageStats[0]?.totalConverted || 0,
          total: (storageStats[0]?.totalOriginal || 0) + (storageStats[0]?.totalConverted || 0)
        },
        revenue: {
          monthly: revenue,
          yearly: revenue * 12
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// @desc    Get conversion analytics
// @route   GET /api/admin/analytics/conversions
// @access  Private/Admin
exports.getConversionAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Conversions by date
    const conversionsByDate = await ConversionHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Conversions by format
    const conversionsByFormat = await ConversionHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            from: '$originalFileType',
            to: '$targetFileType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Most active users
    const mostActiveUsers = await ConversionHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          userId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$userId',
          conversions: { $sum: 1 }
        }
      },
      { $sort: { conversions: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          plan: '$user.plan',
          conversions: 1
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        conversionsByDate,
        conversionsByFormat,
        mostActiveUsers
      }
    });
  } catch (error) {
    console.error('Get conversion analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversion analytics'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { plan, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (plan) user.plan = plan;
    if (role) user.role = role;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    // Also delete user's conversion history
    await ConversionHistory.deleteMany({ userId: user._id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Get all conversions
// @route   GET /api/admin/conversions
// @access  Private/Admin
exports.getAllConversions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    const query = status ? { status } : {};

    const conversions = await ConversionHistory.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ConversionHistory.countDocuments(query);

    res.json({
      success: true,
      conversions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all conversions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversions'
    });
  }
};

// @desc    Delete conversion
// @route   DELETE /api/admin/conversions/:id
// @access  Private/Admin
exports.deleteConversion = async (req, res) => {
  try {
    const conversion = await ConversionHistory.findById(req.params.id);

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    await conversion.deleteOne();

    res.json({
      success: true,
      message: 'Conversion deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversion'
    });
  }
};

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private/Admin
exports.getSystemHealth = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    // Uptime
    const uptime = process.uptime();

    res.json({
      success: true,
      health: {
        database: {
          status: dbStatus,
          state: dbState
        },
        server: {
          uptime: uptime,
          memory: {
            rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
            heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
            heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB'
          },
          platform: process.platform,
          nodeVersion: process.version
        }
      }
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system health'
    });
  }
};