const { Client, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');
const User = require('../models/User');
const Gang = require('../models/Gang');
const Activity = require('../models/Activity');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully from Discord bot');
    } catch (err) {
        console.error('MongoDB connection error from Discord bot:', err);
        process.exit(1);
    }
};

// Event handlers
client.once('ready', async () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);

    // Connect to database
    await connectDB();

    // Initial sync
    await syncGuildData();
});

// Function to sync guild data with MongoDB
async function syncGuildData() {
    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            console.error('Guild not found with provided GUILD_ID');
            return;
        }

        // Fetch all guild members
        await guild.members.fetch();

        console.log(`Starting data sync for guild: ${guild.name}`);

        // Update or create users from Discord members
        await syncUsers(guild);

        // Sync gangs (roles) from Discord
        await syncGangs(guild);

        console.log('Data synchronization completed');
    } catch (error) {
        console.error('Error syncing guild data:', error);
    }
}

// Sync users from Discord to MongoDB
async function syncUsers(guild) {
    try {
        const members = guild.members.cache.filter(member => !member.user.bot);
        console.log(`Syncing ${members.size} users from Discord`);

        let updatedCount = 0;
        let createdCount = 0;

        for (const [id, member] of members) {
            try {
                const existingUser = await User.findOne({ discordId: id });

                if (existingUser) {
                    // Update existing user
                    existingUser.username = member.user.username;
                    existingUser.avatar = member.user.avatar
                        ? `https://cdn.discordapp.com/avatars/${id}/${member.user.avatar}.png`
                        : null;

                    // Find gang (role) association
                    const gangRole = member.roles.cache.find(role => role.name.startsWith('Gang:'));
                    if (gangRole) {
                        const gangName = gangRole.name.replace('Gang:', '').trim();
                        const gang = await Gang.findOne({ name: gangName });
                        if (gang) {
                            existingUser.gangId = gang._id;
                        }
                    }

                    await existingUser.save();
                    updatedCount++;
                } else {
                    // Create new user
                    const newUser = {
                        discordId: id,
                        username: member.user.username,
                        avatar: member.user.avatar
                            ? `https://cdn.discordapp.com/avatars/${id}/${member.user.avatar}.png`
                            : null,
                        points: 0,
                        weeklyPoints: 0,
                    };

                    // Find gang (role) association
                    const gangRole = member.roles.cache.find(role => role.name.startsWith('Gang:'));
                    if (gangRole) {
                        const gangName = gangRole.name.replace('Gang:', '').trim();
                        const gang = await Gang.findOne({ name: gangName });
                        if (gang) {
                            newUser.gangId = gang._id;
                        }
                    }

                    await User.create(newUser);
                    createdCount++;
                }
            } catch (error) {
                console.error(`Error processing user ${id}:`, error);
            }
        }

        console.log(`User sync complete. Created: ${createdCount}, Updated: ${updatedCount}`);
    } catch (error) {
        console.error('Error syncing users:', error);
    }
}

// Sync gangs from Discord roles to MongoDB
async function syncGangs(guild) {
    try {
        const gangRoles = guild.roles.cache.filter(role => role.name.startsWith('Gang:'));
        console.log(`Syncing ${gangRoles.size} gangs from Discord roles`);

        let updatedCount = 0;
        let createdCount = 0;

        for (const [id, role] of gangRoles) {
            try {
                const gangName = role.name.replace('Gang:', '').trim();
                const existingGang = await Gang.findOne({ name: gangName });

                if (existingGang) {
                    // Update existing gang
                    existingGang.icon = guild.iconURL();
                    existingGang.color = role.hexColor;
                    await existingGang.save();
                    updatedCount++;
                } else {
                    // Create new gang
                    await Gang.create({
                        name: gangName,
                        description: `${gangName} gang from Discord`,
                        icon: guild.iconURL(),
                        color: role.hexColor,
                        discordRoleId: id
                    });
                    createdCount++;
                }
            } catch (error) {
                console.error(`Error processing gang role ${id}:`, error);
            }
        }

        console.log(`Gang sync complete. Created: ${createdCount}, Updated: ${updatedCount}`);
    } catch (error) {
        console.error('Error syncing gangs:', error);
    }
}

// Event handler for point tracking
client.on('messageCreate', async (message) => {
    try {
        // Ignore bot messages and messages not in the tracked guild
        if (message.author.bot || message.guild.id !== process.env.GUILD_ID) return;

        // Check if this message should award points
        if (canReceivePointsForMessage(message)) {
            // Find the user in the database
            const user = await User.findOne({ discordId: message.author.id });

            if (!user) return;

            // Award points
            const pointsAwarded = calculatePoints(message);
            user.points += pointsAwarded;
            user.weeklyPoints += pointsAwarded;
            await user.save();

            // Log activity
            await Activity.create({
                type: 'points',
                userId: user._id,
                gangId: user.gangId,
                details: {
                    points: pointsAwarded,
                    reason: 'Discord message',
                    channelId: message.channel.id
                }
            });
        }
    } catch (error) {
        console.error('Error processing message for points:', error);
    }
});

// Logic to determine if a message should receive points
function canReceivePointsForMessage(message) {
    // Example logic - you can customize based on your requirements
    // For example, only award points for messages in specific channels
    return message.content.length > 5; // Simple example: only messages longer than 5 characters
}

// Calculate points to award
function calculatePoints(message) {
    // Example logic - customize based on your requirements
    let points = 1; // Base point

    // Longer messages get more points (just an example)
    if (message.content.length > 100) {
        points = 3;
    } else if (message.content.length > 50) {
        points = 2;
    }

    return points;
}

// Event handler for role changes (gang membership changes)
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
        if (newMember.guild.id !== process.env.GUILD_ID) return;

        // Check for gang role changes
        const oldGangRole = oldMember.roles.cache.find(role => role.name.startsWith('Gang:'));
        const newGangRole = newMember.roles.cache.find(role => role.name.startsWith('Gang:'));

        // If gang role hasn't changed, nothing to do
        if (
            (oldGangRole && newGangRole && oldGangRole.id === newGangRole.id) ||
            (!oldGangRole && !newGangRole)
        ) {
            return;
        }

        // Find the user
        const user = await User.findOne({ discordId: newMember.id });
        if (!user) return;

        // User left a gang
        if (oldGangRole && (!newGangRole || oldGangRole.id !== newGangRole.id)) {
            const oldGangName = oldGangRole.name.replace('Gang:', '').trim();
            const oldGang = await Gang.findOne({ name: oldGangName });

            if (oldGang) {
                await Activity.create({
                    type: 'leave',
                    userId: user._id,
                    gangId: oldGang._id,
                    details: { previousGangId: oldGang._id }
                });
            }
        }

        // User joined a new gang
        if (newGangRole && (!oldGangRole || oldGangRole.id !== newGangRole.id)) {
            const newGangName = newGangRole.name.replace('Gang:', '').trim();
            const newGang = await Gang.findOne({ name: newGangName });

            if (newGang) {
                user.gangId = newGang._id;
                await user.save();

                await Activity.create({
                    type: 'join',
                    userId: user._id,
                    gangId: newGang._id,
                    details: {}
                });
            }
        }
    } catch (error) {
        console.error('Error processing role change:', error);
    }
});

// Scheduled tasks
const ONE_HOUR = 60 * 60 * 1000;
setInterval(async () => {
    try {
        await syncGuildData();
    } catch (error) {
        console.error('Error in scheduled sync:', error);
    }
}, ONE_HOUR);

// Reset weekly points every Monday at midnight
setInterval(async () => {
    try {
        const now = new Date();
        if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() < 5) {
            console.log('Resetting weekly points');
            await User.updateMany({}, { $set: { weeklyPoints: 0 } });

            // Log the weekly reset
            await Activity.create({
                type: 'system',
                details: { event: 'weekly_reset' }
            });
        }
    } catch (error) {
        console.error('Error in weekly points reset:', error);
    }
}, 5 * 60 * 1000); // Check every 5 minutes

// Start the bot
function startBot() {
    try {
        // Caso o ambiente não seja de produção, apenas simulamos o bot
        if (process.env.NODE_ENV !== 'production') {
            console.log('Bot não iniciado em ambiente de desenvolvimento. Simulando operação...');
            return;
        }

        // Iniciar login do bot
        client.login(process.env.DISCORD_BOT_TOKEN)
            .then(() => {
                console.log('Bot inicializado com sucesso!');
            })
            .catch(err => {
                console.error('Erro ao iniciar o bot Discord:', err);
            });
    } catch (error) {
        console.error('Erro ao configurar o bot Discord:', error);
    }
}

// Export the necessary functions
module.exports = {
    startBot,
    client,
    syncGuildData  // Export the syncGuildData function for use in API
}; 