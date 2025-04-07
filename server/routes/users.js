const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Helper function to format dates consistently
const formatDate = (dateObj) => {
    if (!dateObj) return null;
    // Format as ISO string and ensure it's a valid date
    try {
        return new Date(dateObj).toISOString();
    } catch (e) {
        console.error('Invalid date:', dateObj);
        return null;
    }
};

// Process user records to ensure dates are properly formatted
const formatUserRecords = (users) => {
    return users.map(user => {
        // Create a clean object without mongoose-specific properties
        const formattedUser = user.toObject ? user.toObject() : { ...user };

        // Format the lastActive, createdAt and updatedAt timestamps
        if (formattedUser.lastActive) {
            formattedUser.lastActive = formatDate(formattedUser.lastActive);
        }
        if (formattedUser.createdAt) {
            formattedUser.createdAt = formatDate(formattedUser.createdAt);
        }
        if (formattedUser.updatedAt) {
            formattedUser.updatedAt = formatDate(formattedUser.updatedAt);
        }

        // Format dates in gangPoints array
        if (formattedUser.gangPoints && Array.isArray(formattedUser.gangPoints)) {
            formattedUser.gangPoints = formattedUser.gangPoints.map(gp => {
                if (gp.lastActive) {
                    gp.lastActive = formatDate(gp.lastActive);
                }
                return gp;
            });
        }

        return formattedUser;
    });
};

// Process activity records to ensure dates are properly formatted
const formatActivityRecords = (activities) => {
    return activities.map(activity => {
        // Create a clean object without mongoose-specific properties
        const formattedActivity = activity.toObject ? activity.toObject() : { ...activity };

        // Format the createdAt and updatedAt timestamps
        if (formattedActivity.createdAt) {
            formattedActivity.createdAt = formatDate(formattedActivity.createdAt);
        }
        if (formattedActivity.updatedAt) {
            formattedActivity.updatedAt = formatDate(formattedActivity.updatedAt);
        }

        return formattedActivity;
    });
};

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skipIndex = (page - 1) * limit;
        const searchTerm = req.query.searchTerm;

        // Build query object
        const query = {};
        if (searchTerm) {
            // Escape special regex characters
            const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { username: { $regex: escapedSearchTerm, $options: 'i' } },
                { currentGangName: { $regex: escapedSearchTerm, $options: 'i' } }
            ];
            console.log('Search term:', searchTerm);
            console.log('Escaped search term:', escapedSearchTerm);
            console.log('Final query:', JSON.stringify(query));
        }

        console.log('Search query:', { searchTerm, query });

        const users = await User.find(query)
            .sort({ points: -1 })
            .limit(limit)
            .skip(skipIndex);

        console.log(`Found ${users.length} users`);
        if (users.length > 0) {
            console.log('Found users:', users.map(u => u.username));
        }

        const total = await User.countDocuments(query);
        console.log(`Total users matching query: ${total}`);

        // Format user data
        const formattedUsers = formatUserRecords(users);

        res.json({
            users: formattedUsers,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

/**
 * @route   GET /api/users/search
 * @desc    Search users by username
 * @access  Public
 */
router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.term;

        if (!searchTerm) {
            return res.status(400).json({ msg: 'Termo de busca é obrigatório' });
        }

        const users = await User.find({
            username: { $regex: searchTerm, $options: 'i' }
        }).limit(10);

        console.log(`Search for "${searchTerm}" found ${users.length} users`);

        // Format user data
        const formattedUsers = formatUserRecords(users);

        res.json(formattedUsers);
    } catch (err) {
        console.error('Error searching users:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by Discord ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ discordId: req.params.id });

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        // Format user data
        const formattedUser = formatUserRecords([user])[0];

        res.json(formattedUser);
    } catch (err) {
        console.error('Error fetching user:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

/**
 * @route   GET /api/users/:id/activity
 * @desc    Get user activity history
 * @access  Public
 */
router.get('/:id/activity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const user = await User.findOne({ discordId: req.params.id });

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        const activity = await ActivityLog.find({
            targetType: 'user',
            targetId: req.params.id
        })
            .sort({ createdAt: -1 })
            .limit(limit);

        console.log(`Found ${activity.length} activity records for user ${req.params.id}`);

        // Format activity data
        const formattedActivity = formatActivityRecords(activity);

        res.json(formattedActivity);
    } catch (err) {
        console.error('Error fetching user activity:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics
 * @access  Public
 */
router.get('/:id/stats', async (req, res) => {
    try {
        const user = await User.findOne({ discordId: req.params.id });

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        // Get message count from user's current gang points
        const currentGangPoints = user.gangPoints.find(g => g.gangId === user.currentGangId);
        const messagePoints = currentGangPoints?.pointsBreakdown?.activity || 0;

        // Get award count from ActivityLog
        const awardCount = await ActivityLog.countDocuments({
            targetType: 'user',
            targetId: req.params.id,
            action: 'award'
        });

        // Calculate weekly progress (compare weekly points to total)
        const weeklyProgress = user.points > 0
            ? (user.weeklyPoints / user.points) * 100
            : 0;

        // Get user gang history
        const gangHistory = user.gangPoints.map(gang => ({
            gangId: gang.gangId,
            gangName: gang.gangName,
            points: gang.points,
            weeklyPoints: gang.weeklyPoints,
            pointsBreakdown: gang.pointsBreakdown,
            weeklyPointsBreakdown: gang.weeklyPointsBreakdown,
            lastActive: formatDate(gang.lastActive)
        }));

        // Get current gang points breakdown
        const pointsBreakdown = currentGangPoints?.pointsBreakdown || {
            messageActivity: 0,
            gamer: 0,
            artAndMemes: 0,
            other: 0
        };
        const weeklyPointsBreakdown = currentGangPoints?.weeklyPointsBreakdown || {
            messageActivity: 0,
            gamer: 0,
            artAndMemes: 0,
            other: 0
        };

        const stats = {
            totalPoints: user.points,
            weeklyPoints: user.weeklyPoints,
            currentGang: {
                gangId: user.currentGangId,
                gangName: user.currentGangName
            },
            messagePoints,
            awardCount,
            weeklyProgress,
            gangHistory,
            pointsBreakdown,
            weeklyPointsBreakdown,
            lastActive: formatDate(user.lastActive)
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching user stats:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;
