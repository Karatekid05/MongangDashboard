const mongoose = require('mongoose');
const Gang = require('./models/Gang');
const User = require('./models/User');
const ActivityLog = require('./models/ActivityLog');
require('dotenv').config();

// Test data to seed the database
const gangsConfig = [
    {
        gangId: "seakings",
        name: "Sea Kings",
        guildId: "1338963846794055700",
        roleId: "1338963846811009024",
        channelId: "1338963847499526257"
    },
    {
        gangId: "thunderbirds",
        name: "Thunder Birds",
        guildId: "1338963846794055700",
        roleId: "1338963846811009025",
        channelId: "1338963847499526258"
    },
    {
        gangId: "fluffyninjas",
        name: "Fluffy Ninjas",
        guildId: "1338963846794055700",
        roleId: "1338963846811009026",
        channelId: "1338963847499526259"
    },
    {
        gangId: "chunkycats",
        name: "Chunky Cats",
        guildId: "1338963846794055700",
        roleId: "1338963846811009027",
        channelId: "1338963847499526260"
    }
];

// Test users
const usersConfig = [
    {
        discordId: "1234567890",
        username: "TestUser1",
        gangId: "seakings"
    },
    {
        discordId: "1234567891",
        username: "TestUser2",
        gangId: "thunderbirds"
    },
    {
        discordId: "1234567892",
        username: "TestUser3",
        gangId: "fluffyninjas"
    },
    {
        discordId: "1234567893",
        username: "TestUser4",
        gangId: "chunkycats"
    }
];

// Function to seed the database
async function seedDatabase() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongang';
        console.log('Connecting to MongoDB...');

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB database:', mongoose.connection.db.databaseName);

        // Clear existing data
        console.log('Clearing existing data...');
        await Gang.deleteMany({});
        await User.deleteMany({});
        await ActivityLog.deleteMany({});

        // Create gangs
        console.log('Creating gangs...');
        for (const gangConfig of gangsConfig) {
            await Gang.create({
                gangId: gangConfig.gangId,
                name: gangConfig.name,
                guildId: gangConfig.guildId,
                roleId: gangConfig.roleId,
                channelId: gangConfig.channelId,
                points: 0,
                weeklyPoints: 0,
                memberCount: 0,
                totalMemberPoints: 0,
                weeklyMemberPoints: 0,
                messageCount: 0,
                weeklyMessageCount: 0,
                pointsBreakdown: {
                    events: 0,
                    competitions: 0,
                    other: 0
                },
                weeklyPointsBreakdown: {
                    events: 0,
                    competitions: 0,
                    other: 0
                }
            });
            console.log(`Created gang: ${gangConfig.name}`);
        }

        // Create users
        console.log('Creating users...');
        for (const userConfig of usersConfig) {
            // Find the gang
            const gang = gangsConfig.find(g => g.gangId === userConfig.gangId);
            if (!gang) {
                console.log(`Gang ${userConfig.gangId} not found for user ${userConfig.username}`);
                continue;
            }

            // Create the user
            const user = await User.create({
                discordId: userConfig.discordId,
                username: userConfig.username,
                currentGangId: userConfig.gangId,
                currentGangName: gang.name,
                gangId: userConfig.gangId,  // For backward compatibility
                gangName: gang.name,
                points: Math.floor(Math.random() * 50) + 10, // Random points between 10 and 60
                weeklyPoints: Math.floor(Math.random() * 20), // Random weekly points between 0 and 20
                gangPoints: [{
                    gangId: userConfig.gangId,
                    gangName: gang.name,
                    points: Math.floor(Math.random() * 50) + 10,
                    weeklyPoints: Math.floor(Math.random() * 20),
                    pointsBreakdown: {
                        games: Math.floor(Math.random() * 10),
                        artAndMemes: Math.floor(Math.random() * 10),
                        activity: Math.floor(Math.random() * 10),
                        gangActivity: Math.floor(Math.random() * 10),
                        other: Math.floor(Math.random() * 10)
                    },
                    weeklyPointsBreakdown: {
                        games: Math.floor(Math.random() * 5),
                        artAndMemes: Math.floor(Math.random() * 5),
                        activity: Math.floor(Math.random() * 5),
                        gangActivity: Math.floor(Math.random() * 5),
                        other: Math.floor(Math.random() * 5)
                    }
                }]
            });

            console.log(`Created user: ${userConfig.username} in gang ${gang.name} with ${user.points} points`);

            // Create a test activity log
            await ActivityLog.create({
                guildId: gang.guildId,
                targetType: 'user',
                targetId: userConfig.discordId,
                targetName: userConfig.username,
                action: 'award',
                points: user.points,
                source: 'activity',
                awardedBy: "1111111111",
                awardedByUsername: "SystemBot",
                reason: "Initial seeding"
            });

            console.log(`Created activity log for user: ${userConfig.username}`);
        }

        // Update gang stats based on users
        console.log('Updating gang statistics...');
        for (const gangConfig of gangsConfig) {
            // Calculate sum of user points for each gang
            const users = await User.find({ currentGangId: gangConfig.gangId });

            const totalMemberPoints = users.reduce((sum, user) => sum + user.points, 0);
            const weeklyMemberPoints = users.reduce((sum, user) => sum + user.weeklyPoints, 0);
            const memberCount = users.length;

            // Update the gang
            await Gang.updateOne(
                { gangId: gangConfig.gangId },
                {
                    $set: {
                        totalMemberPoints,
                        weeklyMemberPoints,
                        memberCount
                    }
                }
            );

            console.log(`Updated gang ${gangConfig.name}: ${totalMemberPoints} total points, ${weeklyMemberPoints} weekly points, ${memberCount} members`);
        }

        console.log('Database seeding complete!');

        // Log some stats
        const totalUsers = await User.countDocuments();
        const totalGangs = await Gang.countDocuments();
        const totalActivities = await ActivityLog.countDocuments();

        console.log(`Statistics: ${totalUsers} users, ${totalGangs} gangs, ${totalActivities} activity logs`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

// Run the seeding function
seedDatabase(); 