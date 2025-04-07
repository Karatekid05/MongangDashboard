const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Gang = require('../models/Gang');

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

// Format user objects to ensure proper date handling
const formatUserObjects = (users) => {
  return users.map(user => {
    const formattedUser = user.toObject ? user.toObject() : { ...user };

    if (formattedUser.lastActive) {
      formattedUser.lastActive = formatDate(formattedUser.lastActive);
    }
    if (formattedUser.createdAt) {
      formattedUser.createdAt = formatDate(formattedUser.createdAt);
    }
    if (formattedUser.updatedAt) {
      formattedUser.updatedAt = formatDate(formattedUser.updatedAt);
    }

    return formattedUser;
  });
};

// Format gang objects to ensure proper date handling
const formatGangObjects = (gangs) => {
  return gangs.map(gang => {
    const formattedGang = gang.toObject ? gang.toObject() : { ...gang };

    if (formattedGang.lastActive) {
      formattedGang.lastActive = formatDate(formattedGang.lastActive);
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

/**
 * @route   GET /api/leaderboard/users
 * @desc    Get user leaderboard with pagination
 * @access  Public
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skipIndex = (page - 1) * limit;

    const users = await User.find()
      .sort({ points: -1 })
      .limit(limit)
      .skip(skipIndex)
      .select('username discordId points weeklyPoints currentGangId currentGangName lastActive');

    const total = await User.countDocuments();
    console.log(`User leaderboard: Found ${users.length} users out of ${total} total`);

    // Format user data for consistent date handling
    const formattedUsers = formatUserObjects(users);

    res.json({
      users: formattedUsers,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (err) {
    console.error('Error fetching user leaderboard:', err.message, err.stack);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET /api/leaderboard/users/weekly
 * @desc    Get weekly user leaderboard
 * @access  Public
 */
router.get('/users/weekly', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skipIndex = (page - 1) * limit;

    const users = await User.find({ weeklyPoints: { $gt: 0 } })
      .sort({ weeklyPoints: -1 })
      .limit(limit)
      .skip(skipIndex)
      .select('username discordId weeklyPoints points currentGangId currentGangName lastActive');

    const total = await User.countDocuments({ weeklyPoints: { $gt: 0 } });
    console.log(`Weekly user leaderboard: Found ${users.length} users with weekly points out of ${total} total`);

    // Format user data for consistent date handling
    const formattedUsers = formatUserObjects(users);

    res.json({
      users: formattedUsers,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (err) {
    console.error('Error fetching weekly user leaderboard:', err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET /api/leaderboard/gangs
 * @desc    Get gang leaderboard
 * @access  Public
 */
router.get('/gangs', async (req, res) => {
  try {
    const gangs = await Gang.find()
      .sort({ totalMemberPoints: -1 })
      .select('name gangId totalMemberPoints weeklyMemberPoints memberCount lastActive');

    console.log(`Gang leaderboard: Found ${gangs.length} gangs`);
    if (gangs.length > 0) {
      console.log('First gang in leaderboard:', {
        name: gangs[0].name,
        gangId: gangs[0].gangId,
        totalMemberPoints: gangs[0].totalMemberPoints
      });
    }

    // Format gang data for consistent date handling
    const formattedGangs = formatGangObjects(gangs);

    res.json(formattedGangs);
  } catch (err) {
    console.error('Error fetching gang leaderboard:', err.message, err.stack);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET /api/leaderboard/gangs/weekly
 * @desc    Get weekly gang leaderboard
 * @access  Public
 */
router.get('/gangs/weekly', async (req, res) => {
  try {
    const gangs = await Gang.find({ weeklyMemberPoints: { $gt: 0 } })
      .sort({ weeklyMemberPoints: -1 })
      .select('name gangId weeklyMemberPoints totalMemberPoints memberCount lastActive');

    console.log(`Weekly gang leaderboard: Found ${gangs.length} gangs with weekly points`);

    // Format gang data for consistent date handling
    const formattedGangs = formatGangObjects(gangs);

    res.json(formattedGangs);
  } catch (err) {
    console.error('Error fetching weekly gang leaderboard:', err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET /api/leaderboard/stats
 * @desc    Get leaderboard statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching leaderboard stats...');

    // Get total points in system
    const totalPointsResult = await User.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$points" },
          totalWeeklyPoints: { $sum: "$weeklyPoints" }
        }
      }
    ]);

    const totalPoints = totalPointsResult[0]?.totalPoints || 0;
    const totalWeeklyPoints = totalPointsResult[0]?.totalWeeklyPoints || 0;
    console.log(`Total points: ${totalPoints}, Total weekly points: ${totalWeeklyPoints}`);

    // Get user with most points
    const topUser = await User.findOne()
      .sort({ points: -1 })
      .select('username discordId points');

    // Get user with most weekly points
    const topWeeklyUser = await User.findOne({ weeklyPoints: { $gt: 0 } })
      .sort({ weeklyPoints: -1 })
      .select('username discordId weeklyPoints');

    // Get top gang
    const topGang = await Gang.findOne()
      .sort({ totalMemberPoints: -1 })
      .select('name gangId totalMemberPoints');

    // Get top weekly gang
    const topWeeklyGang = await Gang.findOne({ weeklyMemberPoints: { $gt: 0 } })
      .sort({ weeklyMemberPoints: -1 })
      .select('name gangId weeklyMemberPoints');

    // Get active users count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const activeUsers = await User.countDocuments({
      lastActive: { $gte: oneWeekAgo }
    });

    const totalUsers = await User.countDocuments();
    const totalGangs = await Gang.countDocuments();

    console.log(`Stats: ${totalUsers} users, ${totalGangs} gangs, ${activeUsers} active users`);
    console.log(`Top user: ${topUser?.username || 'None'}, Top gang: ${topGang?.name || 'None'}`);

    // Format top entities if they exist
    const formattedTopUser = topUser ? formatUserObjects([topUser])[0] : null;
    const formattedTopWeeklyUser = topWeeklyUser ? formatUserObjects([topWeeklyUser])[0] : null;
    const formattedTopGang = topGang ? formatGangObjects([topGang])[0] : null;
    const formattedTopWeeklyGang = topWeeklyGang ? formatGangObjects([topWeeklyGang])[0] : null;

    const stats = {
      totalPoints,
      totalWeeklyPoints,
      topUser: formattedTopUser,
      topWeeklyUser: formattedTopWeeklyUser,
      topGang: formattedTopGang,
      topWeeklyGang: formattedTopWeeklyGang,
      totalUsers,
      activeUsers,
      totalGangs
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching leaderboard stats:', err.message, err.stack);
    res.status(500).send('Server error');
  }
});

module.exports = router;
