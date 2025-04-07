// Mock data for development and fallback purposes

// Leaderboard mock data
export const leaderboardMockData = {
    stats: {
        totalUsers: 1,
        totalGangs: 1,
        totalPoints: 11,
        totalWeeklyPoints: 11,
        activeUsers: 1,
        topGang: {
            id: "1",
            name: "Sea Kings",
            icon: "https://ui-avatars.com/api/?name=Sea+Kings&background=0D8ABC&color=fff",
            totalMemberPoints: 10,
            memberCount: 1
        },
        topUser: {
            discordId: "123456789",
            username: "karatekid05",
            avatar: null,
            points: 11,
            gangId: "1"
        }
    },
    gangs: [
        { id: "1", name: "Sea Kings", icon: "https://ui-avatars.com/api/?name=Sea+Kings&background=0D8ABC&color=fff", totalMemberPoints: 10, memberCount: 1 }
    ],
    users: {
        users: [
            { discordId: "123456789", username: "karatekid05", avatar: null, points: 11, gangId: "1", gang: { name: "Sea Kings" } }
        ],
        totalCount: 1,
        totalPages: 1
    },
    weeklyGangs: [
        { id: "1", name: "Sea Kings", icon: "https://ui-avatars.com/api/?name=Sea+Kings&background=0D8ABC&color=fff", weeklyPoints: 10, memberCount: 1 }
    ],
    weeklyUsers: {
        users: [
            { discordId: "123456789", username: "karatekid05", avatar: null, weeklyPoints: 11, gangId: "1", gang: { name: "Sea Kings" } }
        ],
        totalCount: 1,
        totalPages: 1
    }
};

// Activities mock data
export const activitiesMockData = {
    activities: [
        {
            id: "1",
            type: "points",
            user: { discordId: "123456789", username: "karatekid05" },
            gang: { id: "1", name: "Sea Kings" },
            details: { points: 11, reason: "Daily participation" },
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        }
    ],
    totalCount: 1,
    totalPages: 1
};

// Gangs mock data
export const gangsMockData = {
    gangs: [
        { id: "1", name: "Sea Kings", icon: "https://ui-avatars.com/api/?name=Sea+Kings&background=0D8ABC&color=fff", description: "A gang dos mares", totalPoints: 10, memberCount: 1, totalMemberPoints: 10, weeklyMemberPoints: 10 }
    ],
    totalCount: 1,
    totalPages: 1
};

// Users mock data
export const usersMockData = {
    users: [
        { discordId: "123456789", username: "karatekid05", avatar: null, points: 11, weeklyPoints: 11, gangId: "1", gang: { name: "Sea Kings", icon: "https://ui-avatars.com/api/?name=Sea+Kings&background=0D8ABC&color=fff" } }
    ],
    totalCount: 1,
    totalPages: 1
}; 