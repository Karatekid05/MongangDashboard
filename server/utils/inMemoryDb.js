create: async (gangData) => {
    const gang = {
        ...gangData,
        _id: gangData.gangId,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        },
        save: async () => gang
    };
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

updateUserPoints: async (userId, points, category) => {
    const user = collections.users.get(userId);

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

    // Make sure changes are persisted
    collections.users.set(userId, user);
}

resetWeeklyPoints: async () => {
    // Reset all users' weekly points
    for (const user of collections.users.values()) {
        user.weeklyPoints = 0;
        for (const gangPoints of user.gangPoints) {
            gangPoints.weeklyPoints = 0;
            gangPoints.weeklyPointsBreakdown.messageActivity = 0;
            gangPoints.weeklyPointsBreakdown.gamer = 0;
            gangPoints.weeklyPointsBreakdown.artAndMemes = 0;
            gangPoints.weeklyPointsBreakdown.other = 0;
        }
        collections.users.set(user.discordId, user);
    }

    // Reset all gangs' weekly points
    for (const gang of collections.gangs.values()) {
        gang.weeklyPoints = 0;
        gang.weeklyMemberPoints = 0;
        gang.weeklyMessageCount = 0;
        gang.weeklyPointsBreakdown.messageActivity = 0;
        gang.weeklyPointsBreakdown.gamer = 0;
        gang.weeklyPointsBreakdown.artAndMemes = 0;
        gang.weeklyPointsBreakdown.other = 0;
        collections.gangs.set(gang.gangId, gang);
    }

    console.log('Weekly points reset completed');
} 