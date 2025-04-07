async function updateGangTotalPoints(gangId) {
    try {
        // Calculate sum of all members' points in the gang by category
        const result = await User.aggregate([
            { $match: { currentGangId: gangId } },
            {
                $group: {
                    _id: null,
                    totalPoints: { $sum: '$points' },
                    messageActivity: { $sum: '$gangPoints.pointsBreakdown.activity' },
                    gamer: { $sum: '$gangPoints.pointsBreakdown.games' },
                    artAndMemes: { $sum: '$gangPoints.pointsBreakdown.artAndMemes' },
                    other: { $sum: '$gangPoints.pointsBreakdown.other' },
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log(`Updating gang ${gangId} total points, aggregation result:`, result);

        if (result.length > 0) {
            const totalPoints = result[0].totalPoints || 0;
            const memberCount = result[0].count || 0;

            console.log(`Gang ${gangId} has ${memberCount} members with total ${totalPoints} points`);

            // Update the gang
            await Gang.updateOne(
                { gangId: gangId },
                {
                    $set: {
                        totalMemberPoints: totalPoints,
                        memberCount: memberCount,
                        'pointsBreakdown.messageActivity': result[0].messageActivity || 0,
                        'pointsBreakdown.gamer': result[0].gamer || 0,
                        'pointsBreakdown.artAndMemes': result[0].artAndMemes || 0,
                        'pointsBreakdown.other': result[0].other || 0
                    }
                }
            );

            // Get the updated gang to verify
            const updatedGang = await Gang.findOne({ gangId: gangId });
            if (updatedGang) {
                console.log(`After update, gang ${gangId} has totalMemberPoints: ${updatedGang.totalMemberPoints}`);
            } else {
                console.log(`Gang ${gangId} not found after update`);
            }
        } else {
            console.log(`No users found in gang ${gangId} or aggregation returned empty result`);

            // Set to 0 if no members found
            await Gang.updateOne(
                { gangId: gangId },
                {
                    $set: {
                        totalMemberPoints: 0,
                        memberCount: 0,
                        'pointsBreakdown.messageActivity': 0,
                        'pointsBreakdown.gamer': 0,
                        'pointsBreakdown.artAndMemes': 0,
                        'pointsBreakdown.other': 0
                    }
                }
            );
        }
    } catch (error) {
        console.error(`Error updating gang total points for ${gangId}:`, error);
    }
}

async function updateGangWeeklyPoints(gangId) {
    try {
        // Calculate sum of all members' weekly points in the gang by category
        const result = await User.aggregate([
            { $match: { currentGangId: gangId } },
            {
                $group: {
                    _id: null,
                    totalWeeklyPoints: { $sum: '$weeklyPoints' },
                    messageActivity: { $sum: '$gangPoints.weeklyPointsBreakdown.activity' },
                    gamer: { $sum: '$gangPoints.weeklyPointsBreakdown.games' },
                    artAndMemes: { $sum: '$gangPoints.weeklyPointsBreakdown.artAndMemes' },
                    other: { $sum: '$gangPoints.weeklyPointsBreakdown.other' },
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log(`Updating gang ${gangId} weekly points, aggregation result:`, result);

        if (result.length > 0) {
            const totalWeeklyPoints = result[0].totalWeeklyPoints || 0;
            const memberCount = result[0].count || 0;

            console.log(`Gang ${gangId} has ${memberCount} members with total ${totalWeeklyPoints} weekly points`);

            // Update the gang
            await Gang.updateOne(
                { gangId: gangId },
                {
                    $set: {
                        weeklyMemberPoints: totalWeeklyPoints,
                        memberCount: memberCount,
                        'weeklyPointsBreakdown.messageActivity': result[0].messageActivity || 0,
                        'weeklyPointsBreakdown.gamer': result[0].gamer || 0,
                        'weeklyPointsBreakdown.artAndMemes': result[0].artAndMemes || 0,
                        'weeklyPointsBreakdown.other': result[0].other || 0
                    }
                }
            );

            // Get the updated gang to verify
            const updatedGang = await Gang.findOne({ gangId: gangId });
            if (updatedGang) {
                console.log(`After update, gang ${gangId} has weeklyMemberPoints: ${updatedGang.weeklyMemberPoints}`);
            } else {
                console.log(`Gang ${gangId} not found after update`);
            }
        } else {
            console.log(`No users found in gang ${gangId} or aggregation returned empty result`);

            // Set to 0 if no members found
            await Gang.updateOne(
                { gangId: gangId },
                {
                    $set: {
                        weeklyMemberPoints: 0,
                        memberCount: 0,
                        'weeklyPointsBreakdown.messageActivity': 0,
                        'weeklyPointsBreakdown.gamer': 0,
                        'weeklyPointsBreakdown.artAndMemes': 0,
                        'weeklyPointsBreakdown.other': 0
                    }
                }
            );
        }
    } catch (error) {
        console.error(`Error updating gang weekly points for ${gangId}:`, error);
    }
}

async function updateUserPoints(userId, points, category) {
    try {
        const user = await User.findOne({ discordId: userId });

        if (!user) {
            console.log(`User ${userId} not found`);
            return;
        }

        const currentGangPoints = user.gangPoints.find(g => g.gangId === user.currentGangId);

        if (!currentGangPoints) {
            console.log(`No gang points found for user ${userId} in gang ${user.currentGangId}`);
            return;
        }

        // Update points in the correct category
        switch (category) {
            case 'messageActivity':
                currentGangPoints.pointsBreakdown.messageActivity += points;
                currentGangPoints.weeklyPointsBreakdown.messageActivity += points;
                break;
            case 'gamer':
                currentGangPoints.pointsBreakdown.gamer += points;
                currentGangPoints.weeklyPointsBreakdown.gamer += points;
                break;
            case 'artAndMemes':
                currentGangPoints.pointsBreakdown.artAndMemes += points;
                currentGangPoints.weeklyPointsBreakdown.artAndMemes += points;
                break;
            case 'other':
                currentGangPoints.pointsBreakdown.other += points;
                currentGangPoints.weeklyPointsBreakdown.other += points;
                break;
            default:
                console.log(`Invalid category ${category}`);
                return;
        }

        // Update total points
        currentGangPoints.points += points;
        currentGangPoints.weeklyPoints += points;

        // Calculate total points from all gangs
        let totalPoints = 0;
        let totalWeeklyPoints = 0;

        // Sum points from all gangs the user belongs to
        for (const g of user.gangPoints) {
            totalPoints += g.points;
            totalWeeklyPoints += g.weeklyPoints;
        }

        // Update the user's total points
        user.points = totalPoints;
        user.weeklyPoints = totalWeeklyPoints;

        await user.save();

        // Update gang points
        await updateGangTotalPoints(user.currentGangId);
        await updateGangWeeklyPoints(user.currentGangId);
    } catch (error) {
        console.error(`Error updating user points for ${userId}:`, error);
    }
}

user.switchGang = function (newGangId, newGangName) {
    if (this.currentGangId === newGangId) return;

    this.currentGangId = newGangId;
    this.currentGangName = newGangName;
    this.gangId = newGangId;
    this.gangName = newGangName;

    const newGangPoints = this.gangPoints.find(g => g.gangId === newGangId);

    if (!newGangPoints) {
        // Create new gang entry if it doesn't exist
        this.gangPoints.push({
            gangId: newGangId,
            gangName: newGangName,
            points: 0,
            weeklyPoints: 0,
            pointsBreakdown: {
                messageActivity: 0,
                gamer: 0,
                artAndMemes: 0,
                other: 0
            },
            weeklyPointsBreakdown: {
                messageActivity: 0,
                gamer: 0,
                artAndMemes: 0,
                other: 0
            }
        });
    }

    // Calculate total points from all gangs
    let totalPoints = 0;
    let totalWeeklyPoints = 0;

    // Sum points from all gangs the user belongs to
    for (const g of this.gangPoints) {
        totalPoints += g.points;
        totalWeeklyPoints += g.weeklyPoints;
    }

    // Update the user's total points
    this.points = totalPoints;
    this.weeklyPoints = totalWeeklyPoints;

    // Make sure changes are persisted
    collections.users.set(this.discordId, this);
};

async function resetWeeklyPoints() {
    try {
        // Reset all users' weekly points
        await User.updateMany(
            {},
            {
                $set: {
                    weeklyPoints: 0,
                    'gangPoints.$[].weeklyPoints': 0,
                    'gangPoints.$[].weeklyPointsBreakdown.messageActivity': 0,
                    'gangPoints.$[].weeklyPointsBreakdown.gamer': 0,
                    'gangPoints.$[].weeklyPointsBreakdown.artAndMemes': 0,
                    'gangPoints.$[].weeklyPointsBreakdown.other': 0
                }
            }
        );

        // Reset all gangs' weekly points
        await Gang.updateMany(
            {},
            {
                $set: {
                    weeklyPoints: 0,
                    weeklyMemberPoints: 0,
                    weeklyMessageCount: 0,
                    'weeklyPointsBreakdown.messageActivity': 0,
                    'weeklyPointsBreakdown.gamer': 0,
                    'weeklyPointsBreakdown.artAndMemes': 0,
                    'weeklyPointsBreakdown.other': 0
                }
            }
        );

        console.log('Weekly points reset completed');
    } catch (error) {
        console.error('Error resetting weekly points:', error);
    }
}

async function resetAllPoints(guildId) {
    const now = new Date();

    // Reset all users' points
    // First, get all users
    const users = await User.find();

    // For each user, reset all points in all their gangs
    for (const user of users) {
        for (const gangPoints of user.gangPoints) {
            // Reset total points
            gangPoints.points = 0;
            gangPoints.pointsBreakdown = {
                messageActivity: 0,
                gamer: 0,
                artAndMemes: 0,
                other: 0
            };

            // Reset weekly points
            gangPoints.weeklyPoints = 0;
            gangPoints.weeklyPointsBreakdown = {
                messageActivity: 0,
                gamer: 0,
                artAndMemes: 0,
                other: 0
            };
        }

        // Also reset main points if applicable
        if (user.currentGangId) {
            user.points = 0;
            user.weeklyPoints = 0;
        }

        user.lastWeeklyReset = now;
        await user.save();
    }

    // Reset all gangs' points
    const gangResult = await Gang.updateMany(
        { guildId: guildId },
        {
            $set: {
                // Reset total points
                points: 0,
                totalMemberPoints: 0,
                messageCount: 0,
                pointsBreakdown: {
                    messageActivity: 0,
                    gamer: 0,
                    artAndMemes: 0,
                    other: 0
                },

                // Reset weekly points
                weeklyPoints: 0,
                weeklyMemberPoints: 0,
                weeklyMessageCount: 0,
                weeklyPointsBreakdown: {
                    messageActivity: 0,
                    gamer: 0,
                    artAndMemes: 0,
                    other: 0
                },
                lastWeeklyReset: now
            }
        }
    );

    return {
        usersReset: users.length,
        gangsReset: gangResult.modifiedCount,
        timestamp: now
    };
}

async function resetUserPoints(userId) {
    const user = await User.findOne({ discordId: userId });

    if (!user) {
        throw new Error('User not found');
    }

    // Reset all gang points
    for (const gangPoints of user.gangPoints) {
        // Reset total points
        gangPoints.points = 0;
        gangPoints.pointsBreakdown = {
            messageActivity: 0,
            gamer: 0,
            artAndMemes: 0,
            other: 0
        };

        // Reset weekly points
        gangPoints.weeklyPoints = 0;
        gangPoints.weeklyPointsBreakdown = {
            messageActivity: 0,
            gamer: 0,
            artAndMemes: 0,
            other: 0
        };
    }

    // Reset main user points
    user.points = 0;
    user.weeklyPoints = 0;

    await user.save();

    // Update gang total points if user has a current gang
    if (user.currentGangId) {
        await updateGangTotalPoints(user.currentGangId);
        await updateGangWeeklyPoints(user.currentGangId);
    }

    return user;
}

// ... existing code ...
// Create new user in database
user = new User({
    discordId: userId,
    username: author.username,
    currentGangId: gangId,
    currentGangName: gangConfig.name,
    gangId: gangId,  // For backward compatibility
    gangName: gangConfig.name,
    points: 0,
    weeklyPoints: 0,
    messageCount: 0,
    weeklyMessageCount: 0,
    gangPoints: [{
        gangId: gangId,
        gangName: gangConfig.name,
        points: 0,
        weeklyPoints: 0,
        pointsBreakdown: {
            messageActivity: 0,
            gamer: 0,
            artAndMemes: 0,
            other: 0
        },
        weeklyPointsBreakdown: {
            messageActivity: 0,
            gamer: 0,
            artAndMemes: 0,
            other: 0
        }
    }],
    recentMessages: []
});
// ... existing code ...

// ... existing code ...
// Check if user has points for this gang
const gangPointsIndex = user.gangPoints.findIndex(g => g.gangId === gangId);

if (gangPointsIndex >= 0) {
    // Add 1 point to this gang's points
    user.gangPoints[gangPointsIndex].points += 1;
    user.gangPoints[gangPointsIndex].weeklyPoints += 1;
    user.gangPoints[gangPointsIndex].pointsBreakdown.messageActivity += 1;
    user.gangPoints[gangPointsIndex].weeklyPointsBreakdown.messageActivity += 1;

    // Log the current state for debugging
    console.log(`Before update: User ${user.username} has ${user.points} total points`);
    console.log(`Gang points for ${gangConfig.name}: ${user.gangPoints[gangPointsIndex].points}`);

    // If this is the user's current gang, also update their top-level points
    if (gangId === user.currentGangId) {
        const currentPoints = user.points || 0;
        const currentWeeklyPoints = user.weeklyPoints || 0;

        // Increment the user's top-level points instead of setting them
        user.points = currentPoints + 1;
        user.weeklyPoints = currentWeeklyPoints + 1;

        console.log(`After update: User ${user.username} now has ${user.points} total points`);
    }
} else {
    // If user doesn't have a record for this gang, create one
    user.gangPoints.push({
        gangId: gangId,
        gangName: gangConfig.name,
        points: 1,
        weeklyPoints: 1,
        pointsBreakdown: {
            messageActivity: 1,
            gamer: 0,
            artAndMemes: 0,
            other: 0
        },
        weeklyPointsBreakdown: {
            messageActivity: 1,
            gamer: 0,
            artAndMemes: 0,
            other: 0
        }
    });

    // If this is the user's current gang, add to their total points
    if (gangId === user.currentGangId) {
        const currentPoints = user.points || 0;
        const currentWeeklyPoints = user.weeklyPoints || 0;

        user.points = currentPoints + 1;
        user.weeklyPoints = currentWeeklyPoints + 1;
    }
}
// ... existing code ... 