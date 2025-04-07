const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Gang = require('../models/Gang');

// Helper function to format dates consistently
const formatDate = (dateObj) => {
    if (!dateObj) return null;

    // Format as ISO string and ensure it's a valid date
    try {
        // Convert string dates to Date objects first
        const date = dateObj instanceof Date ? dateObj : new Date(dateObj);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid date object:', dateObj);
            return null;
        }

        return date.toISOString();
    } catch (e) {
        console.error('Error formatting date:', e, dateObj);
        return null;
    }
};

// Process activity records to ensure dates are properly formatted
const formatActivityRecords = (activities) => {
    return activities.map(activity => {
        try {
            // Create a clean object without mongoose-specific properties
            const formattedActivity = activity.toObject ? activity.toObject() : { ...activity };

            // Format the createdAt and updatedAt timestamps
            if (formattedActivity.createdAt) {
                formattedActivity.createdAt = formatDate(formattedActivity.createdAt);
            }
            if (formattedActivity.updatedAt) {
                formattedActivity.updatedAt = formatDate(formattedActivity.updatedAt);
            }
            // Also format the timestamp field if it exists
            if (formattedActivity.timestamp) {
                formattedActivity.timestamp = formatDate(formattedActivity.timestamp);
            }

            return formattedActivity;
        } catch (error) {
            console.error('Error formatting activity record:', error);
            return activity;
        }
    });
};

/**
 * @route   GET /api/activity
 * @desc    Get recent activity with pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skipIndex = (page - 1) * limit;
        const searchTerm = req.query.searchTerm;
        const type = req.query.type;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        const gangId = req.query.gangId;
        const userId = req.query.userId;

        // Build query object
        const query = {};

        // Add type filter if specified
        if (type) {
            query.action = type;
        }

        // Add gang filter if specified
        if (gangId) {
            query.targetId = gangId;
            query.targetType = 'gang';
        }

        // Add user filter if specified
        if (userId) {
            query.targetId = userId;
            query.targetType = 'user';
        }

        // Add search filter if specified
        if (searchTerm) {
            query.$or = [
                { message: { $regex: searchTerm, $options: 'i' } },
                { targetName: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // First get the activities
        const activities = await ActivityLog.find(query)
            .sort(sort)
            .skip(skipIndex)
            .limit(limit);

        // Just format timestamps, remove gang lookup logic
        const formattedActivities = activities.map(activity => {
            const formattedActivity = activity.toObject();

            // Format timestamps
            if (formattedActivity.createdAt) {
                formattedActivity.createdAt = formatDate(formattedActivity.createdAt);
            }
            if (formattedActivity.updatedAt) {
                formattedActivity.updatedAt = formatDate(formattedActivity.updatedAt);
            }
            if (formattedActivity.timestamp) {
                formattedActivity.timestamp = formatDate(formattedActivity.timestamp);
            }

            return formattedActivity;
        });

        const total = await ActivityLog.countDocuments(query);

        res.json({
            activities: formattedActivities,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalActivities: total
        });
    } catch (err) {
        console.error('Error fetching activities:', err.message);
        res.status(500).send('Error del servidor');
    }
});

/**
 * @route   GET /api/activity/stats
 * @desc    Get activity statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        // Get activity counts by action type
        const awardCount = await ActivityLog.countDocuments({
            action: 'award'
        });

        const deductCount = await ActivityLog.countDocuments({
            action: 'deduct'
        });

        // Get today's activity
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCount = await ActivityLog.countDocuments({
            createdAt: { $gte: today }
        });

        // Get last 7 days activity
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        lastWeek.setHours(0, 0, 0, 0);

        const weeklyCount = await ActivityLog.countDocuments({
            createdAt: { $gte: lastWeek }
        });

        // Get daily activity for the past week
        const dailyActivity = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: lastWeek }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get hourly activity distribution
        const hourlyActivity = await ActivityLog.aggregate([
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const stats = {
            totalActivities: await ActivityLog.countDocuments(),
            awardCount,
            deductCount,
            todayCount,
            weeklyCount,
            dailyActivity,
            hourlyActivity
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching activity stats:', err.message);
        res.status(500).send('Error del servidor');
    }
});

/**
 * @route   GET /api/activity/leaderboard
 * @desc    Get most active users/gangs
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
    try {
        // Get most active users this week
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const mostActiveUsers = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: lastWeek },
                    targetType: 'user'
                }
            },
            {
                $group: {
                    _id: "$targetId",
                    username: { $first: "$targetName" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Get most active gangs this week
        const mostActiveGangs = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: lastWeek },
                    targetType: 'gang'
                }
            },
            {
                $group: {
                    _id: "$targetId",
                    gangName: { $first: "$targetName" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.json({
            mostActiveUsers,
            mostActiveGangs
        });
    } catch (err) {
        console.error('Error fetching activity leaderboard:', err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router; 