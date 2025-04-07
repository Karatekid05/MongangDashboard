const express = require('express');
const router = express.Router();
const Gang = require('../models/Gang');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

// Helper function to format dates consistently
const formatDate = (dateObj) => {
    if (!dateObj) return null;

    try {
        const date = new Date(dateObj);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (isNaN(diffInSeconds)) return null;

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    } catch (e) {
        console.error('Invalid date:', dateObj, e);
        return null;
    }
};

// Process gang records to ensure dates are properly formatted
const formatGangRecords = (gangs) => {
    return gangs.map(gang => {
        // Create a clean object without mongoose-specific properties
        const formattedGang = gang.toObject ? gang.toObject() : { ...gang };

        // Format the lastActive, createdAt and updatedAt timestamps
        if (formattedGang.lastActive) {
            formattedGang.lastActive = formatDate(formattedGang.lastActive);
        }
        if (formattedGang.lastWeeklyReset) {
            formattedGang.lastWeeklyReset = formatDate(formattedGang.lastWeeklyReset);
        }
        if (formattedGang.createdAt) {
            formattedGang.createdAt = formatDate(formattedGang.createdAt);
        }
        if (formattedGang.updatedAt) {
            formattedGang.updatedAt = formatDate(formattedGang.updatedAt);
        }

        return formattedGang;
    });
};

// Helper function to format activity records
const formatActivityRecords = (activities) => {
    return activities.map(activity => {
        // Create a clean object without mongoose-specific properties
        const formattedActivity = activity.toObject ? activity.toObject() : { ...activity };

        // Map old source types to new ones
        let type = formattedActivity.source;
        switch (type?.toLowerCase()) {
            case 'activity':
            case 'chat':
                type = 'messageActivity';
                break;
            case 'games':
            case 'game':
                type = 'gamer';
                break;
            case 'art':
            case 'meme':
            case 'memes':
                type = 'artAndMemes';
                break;
            case 'gang':
            case 'gangactivity':
                type = 'other';
                break;
            default:
                type = 'other';
        }

        // Generate a descriptive message based on the activity type
        let message = formattedActivity.reason;
        if (!message) {
            if (formattedActivity.targetType === 'user') {
                message = `${formattedActivity.targetName} earned ${formattedActivity.points} points from ${type}`;
            } else {
                message = `Gang earned ${formattedActivity.points} points from ${type}`;
            }
        }

        // Format the activity to match frontend expectations
        const formatted = {
            id: formattedActivity._id.toString(),
            type: type,
            points: formattedActivity.points || 0,
            message: message,
            createdAt: formatDate(formattedActivity.createdAt),
            updatedAt: formatDate(formattedActivity.updatedAt)
        };

        // Add user info if it's a user activity
        if (formattedActivity.targetType === 'user') {
            formatted.user = {
                id: formattedActivity.targetId,
                username: formattedActivity.targetName
            };
        }

        // Add gang info if it's a gang activity
        if (formattedActivity.targetType === 'gang') {
            formatted.gang = {
                id: formattedActivity.targetId,
                name: formattedActivity.targetName
            };
        }

        // Add awarded by info if available
        if (formattedActivity.awardedBy) {
            formatted.awardedBy = {
                id: formattedActivity.awardedBy,
                username: formattedActivity.awardedByUsername || 'Unknown'
            };
        }

        console.log('Formatted activity:', formatted);
        return formatted;
    });
};

// Helper function to calculate total gang points and breakdown
const calculateGangPoints = async (gang) => {
    // Get all members of the gang
    const members = await User.find({ currentGangId: gang.gangId });

    // Initialize point breakdowns
    const pointsBreakdown = {
        messageActivity: 0,
        gamer: 0,
        artAndMemes: 0,
        other: 0
    };

    const weeklyPointsBreakdown = {
        messageActivity: 0,
        gamer: 0,
        artAndMemes: 0,
        other: 0
    };

    // Calculate total points and breakdowns from all members
    let totalMemberPoints = 0;
    let weeklyMemberPoints = 0;

    // Add member points to the breakdown
    for (const member of members) {
        // Add to total points
        totalMemberPoints += member.points || 0;
        weeklyMemberPoints += member.weeklyPoints || 0;

        // Get this member's gang points for this gang
        const gangPoints = member.gangPoints?.find(g => g.gangId === gang.gangId);
        if (gangPoints) {
            // Add to total breakdown
            if (gangPoints.pointsBreakdown) {
                pointsBreakdown.messageActivity += gangPoints.pointsBreakdown.messageActivity || 0;
                pointsBreakdown.gamer += gangPoints.pointsBreakdown.gamer || 0;
                pointsBreakdown.artAndMemes += gangPoints.pointsBreakdown.artAndMemes || 0;
                pointsBreakdown.other += gangPoints.pointsBreakdown.other || 0;
            }

            // Add to weekly breakdown
            if (gangPoints.weeklyPointsBreakdown) {
                weeklyPointsBreakdown.messageActivity += gangPoints.weeklyPointsBreakdown.messageActivity || 0;
                weeklyPointsBreakdown.gamer += gangPoints.weeklyPointsBreakdown.gamer || 0;
                weeklyPointsBreakdown.artAndMemes += gangPoints.weeklyPointsBreakdown.artAndMemes || 0;
                weeklyPointsBreakdown.other += gangPoints.weeklyPointsBreakdown.other || 0;
            }
        }
    }

    // Add message activity from gang's message count
    pointsBreakdown.messageActivity += gang.messageCount || 0;
    weeklyPointsBreakdown.messageActivity += gang.weeklyMessageCount || 0;

    // Update the gang's points
    gang.totalMemberPoints = totalMemberPoints;
    gang.weeklyMemberPoints = weeklyMemberPoints;
    gang.pointsBreakdown = pointsBreakdown;
    gang.weeklyPointsBreakdown = weeklyPointsBreakdown;
    await gang.save();

    console.log(`Updated gang ${gang.name} points:`, {
        totalMemberPoints,
        weeklyMemberPoints,
        pointsBreakdown,
        weeklyPointsBreakdown
    });

    return {
        totalPoints: totalMemberPoints,
        weeklyPoints: weeklyMemberPoints,
        pointsBreakdown,
        weeklyPointsBreakdown
    };
};

/**
 * @route   GET /api/gangs
 * @desc    Get all gangs
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // Adjusted query to not filter by guildId
        const gangs = await Gang.find().sort({ totalMemberPoints: -1 });
        console.log(`Found ${gangs.length} gangs`);

        // Log the first gang if any exist
        if (gangs.length > 0) {
            console.log('First gang sample:', gangs[0]);

            // Recalculate points for all gangs
            console.log('Recalculating points for all gangs...');
            await Promise.all(gangs.map(gang => calculateGangPoints(gang)));

            // Re-sort gangs by total points after recalculation
            gangs.sort((a, b) => b.totalMemberPoints - a.totalMemberPoints);
        }

        // Format gang data
        const formattedGangs = formatGangRecords(gangs);

        res.json(formattedGangs);
    } catch (err) {
        console.error('Error fetching gangs:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

/**
 * @route   GET /api/gangs/:id
 * @desc    Get gang by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const gangId = req.params.id;
        console.log(`Looking for gang with ID: ${gangId}`);

        // Tentar encontrar por gangId primeiro
        let gang = await Gang.findOne({ gangId: gangId });

        // Se não encontrar, tentar por _id (caso o ID seja um ObjectId válido)
        if (!gang && mongoose.Types.ObjectId.isValid(gangId)) {
            console.log('Não encontrado por gangId, tentando por _id');
            gang = await Gang.findById(gangId);
        }

        if (!gang) {
            console.log(`Gang não encontrada com ID: ${gangId}`);
            return res.status(404).json({ msg: 'Gang não encontrada', id: gangId });
        }

        console.log(`Gang encontrada: ${gang.name} (${gang.gangId})`);

        // Recalculate total points before returning
        const points = await calculateGangPoints(gang);
        console.log(`Recalculated points for gang ${gang.name}:`, points);

        // Format gang data
        const formattedGang = formatGangRecords([gang])[0];

        // Garantir que o campo id está presente
        if (!formattedGang.id) {
            formattedGang.id = formattedGang.gangId || gang._id.toString();
        }

        res.json(formattedGang);
    } catch (err) {
        console.error('Error fetching gang:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

/**
 * @route   GET /api/gangs/:id/members
 * @desc    Get all members of a gang
 * @access  Public
 */
router.get('/:id/members', async (req, res) => {
    try {
        const gangId = req.params.id;
        console.log(`Fetching members for gang ID: ${gangId}`);

        // Verificar se a gang existe primeiro
        let gang = await Gang.findOne({ gangId: gangId });

        // Se não encontrar, tentar por _id
        if (!gang && mongoose.Types.ObjectId.isValid(gangId)) {
            gang = await Gang.findById(gangId);
        }

        if (!gang) {
            console.log(`Gang não encontrada com ID: ${gangId}`);
            return res.status(404).json({ msg: 'Gang não encontrada', id: gangId });
        }

        // Usar o gangId da gang encontrada
        const effectiveGangId = gang.gangId;

        const users = await User.find({ currentGangId: effectiveGangId }).sort({ points: -1 });
        console.log(`Found ${users.length} members for gang ${effectiveGangId}`);

        // Format user data for consistent date handling
        const formattedUsers = users.map(user => {
            const userData = user.toObject();
            if (userData.lastActive) {
                userData.lastActive = formatDate(userData.lastActive);
            }
            if (userData.createdAt) {
                userData.createdAt = formatDate(userData.createdAt);
            }
            if (userData.updatedAt) {
                userData.updatedAt = formatDate(userData.updatedAt);
            }
            return userData;
        });

        res.json(formattedUsers);
    } catch (err) {
        console.error('Error fetching gang members:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

/**
 * @route   GET /api/gangs/:id/activity
 * @desc    Get recent activity for a gang
 * @access  Public
 */
router.get('/:id/activity', async (req, res) => {
    try {
        const gangId = req.params.id;
        console.log(`Fetching activity for gang ID: ${gangId}`);

        // Verificar se a gang existe primeiro
        let gang = await Gang.findOne({ gangId: gangId });

        // Se não encontrar, tentar por _id
        if (!gang && mongoose.Types.ObjectId.isValid(gangId)) {
            gang = await Gang.findById(gangId);
        }

        if (!gang) {
            console.log(`Gang não encontrada com ID: ${gangId}`);
            return res.status(404).json({ msg: 'Gang não encontrada', id: gangId });
        }

        // Usar o gangId da gang encontrada
        const effectiveGangId = gang.gangId;

        const limit = parseInt(req.query.limit) || 20;

        // Find activities related to the gang or its members
        const activities = await ActivityLog.find({
            $or: [
                // Activities directly related to the gang
                { targetType: 'gang', targetId: { $in: [effectiveGangId, gang._id.toString(), gangId] } },
                // Activities of gang members
                {
                    targetType: 'user',
                    targetId: {
                        $in: (await User.find({ currentGangId: effectiveGangId }, 'discordId'))
                            .map(user => user.discordId)
                    }
                }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(limit);

        console.log(`Found ${activities.length} activities for gang ${effectiveGangId} and its members`);

        // Format activity data
        const formattedActivity = formatActivityRecords(activities);

        res.json(formattedActivity);
    } catch (err) {
        console.error('Error fetching gang activity:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

/**
 * @route   GET /api/gangs/:id/stats
 * @desc    Get statistics for a gang
 * @access  Public
 */
router.get('/:id/stats', async (req, res) => {
    try {
        const gangId = req.params.id;
        console.log(`Fetching stats for gang ID: ${gangId}`);

        // Verificar se a gang existe primeiro
        let gang = await Gang.findOne({ gangId: gangId });

        // Se não encontrar, tentar por _id
        if (!gang && mongoose.Types.ObjectId.isValid(gangId)) {
            gang = await Gang.findById(gangId);
        }

        if (!gang) {
            console.log(`Gang não encontrada com ID: ${gangId}`);
            return res.status(404).json({ msg: 'Gang não encontrada', id: gangId });
        }

        // Usar o gangId da gang encontrada
        const effectiveGangId = gang.gangId;

        // Recalculate total and weekly points
        const points = await calculateGangPoints(gang);
        console.log(`Recalculated points for gang ${effectiveGangId}:`, points);

        // Get member count 
        const memberCount = await User.countDocuments({ currentGangId: effectiveGangId });

        // Get top member
        const topMember = await User.findOne({ currentGangId: effectiveGangId }).sort({ points: -1 });

        // Get recent activity for both gang and its members
        const recentActivity = await ActivityLog.find({
            $or: [
                // Activities directly related to the gang
                { targetType: 'gang', targetId: { $in: [effectiveGangId, gang._id.toString(), gangId] } },
                // Activities of gang members
                {
                    targetType: 'user',
                    targetId: {
                        $in: (await User.find({ currentGangId: effectiveGangId }, 'discordId'))
                            .map(user => user.discordId)
                    }
                }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate weekly progress (compare current weekly points to total)
        const weeklyProgress = points.totalPoints > 0
            ? (points.weeklyPoints / points.totalPoints) * 100
            : 0;

        // Format activity data
        const formattedActivity = formatActivityRecords(recentActivity);

        const stats = {
            id: gang._id.toString(),
            gangId: effectiveGangId,
            totalPoints: points.totalPoints,
            weeklyPoints: points.weeklyPoints,
            memberCount,
            messageCount: gang.messageCount,
            weeklyMessageCount: gang.weeklyMessageCount,
            pointsBreakdown: points.pointsBreakdown,
            weeklyPointsBreakdown: points.weeklyPointsBreakdown,
            topMember: topMember ? {
                id: topMember.discordId,
                username: topMember.username,
                points: topMember.points
            } : null,
            weeklyProgress,
            recentActivity: formattedActivity,
            lastActive: formatDate(gang.lastActive)
        };

        console.log('Sending stats:', stats);
        res.json(stats);
    } catch (err) {
        console.error('Error fetching gang stats:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;
