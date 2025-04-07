const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
require('dotenv').config();

// Import routes
const gangRoutes = require('./routes/gangs');
const userRoutes = require('./routes/users');
const leaderboardRoutes = require('./routes/leaderboard');
const activityRoutes = require('./routes/activity');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/gangs', gangRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/activity', activityRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Mongang API Server',
        status: 'Running',
        endpoints: {
            health: '/api/health',
            gangs: '/api/gangs',
            users: '/api/users',
            leaderboard: '/api/leaderboard',
            activity: '/api/activity',
            syncDiscord: '/api/sync-discord'
        }
    });
});

// Database connection
const connectDB = async () => {
    try {
        // Use environment variable or local MongoDB for development
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongang';

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
        return true;
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.log('Attempting to continue without MongoDB connection...');
        return false;
    }
};

// Separate function to start Discord bot
const startDiscordBot = async () => {
    try {
        // Only attempt to import and start bot if required environment variables exist
        if (process.env.DISCORD_BOT_TOKEN && process.env.GUILD_ID) {
            // Import Discord bot - using dynamic import for better error handling
            const { startBot } = require('./bot/discordBot');
            // Start the bot and handle any errors
            await startBot();
            console.log('Discord bot started successfully');
            return true;
        } else {
            console.log('Discord bot not started: missing environment variables');
            return false;
        }
    } catch (err) {
        console.error('Error starting Discord bot:', err.message);
        return false;
    }
};

// Force sync with Discord data
app.get('/api/sync-discord', async (req, res) => {
    try {
        if (!process.env.DISCORD_BOT_TOKEN || !process.env.GUILD_ID) {
            return res.status(400).json({
                success: false,
                message: 'Discord bot not configured: missing environment variables'
            });
        }

        // Import directly from discordBot
        const { syncGuildData } = require('./bot/discordBot');

        if (typeof syncGuildData === 'function') {
            // Start sync process
            await syncGuildData();
            res.json({
                success: true,
                message: 'Discord data sync initiated'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'syncGuildData function not available'
            });
        }
    } catch (error) {
        console.error('Error syncing Discord data:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing Discord data',
            error: error.message
        });
    }
});

// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
    // Serve static assets from the client build folder
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Handle any requests that don't match the ones above
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        botEnabled: !!process.env.DISCORD_BOT_TOKEN,
        dbConnected: mongoose.connection.readyState === 1
    });
});

// Initialize server with separate function for better control
const initializeServer = async () => {
    try {
        // Connect to MongoDB first
        const dbConnected = await connectDB();

        // Start Discord bot after DB connection (if configured)
        let botStarted = false;
        if (dbConnected && process.env.START_DISCORD_BOT === 'true') {
            botStarted = await startDiscordBot();
        }

        // Start HTTP server
        const PORT = process.env.PORT || 3002;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT} (0.0.0.0)`);
            console.log(`Database connected: ${dbConnected ? 'Yes' : 'No'}`);
            console.log(`Discord bot running: ${botStarted ? 'Yes' : 'No'}`);
        });
    } catch (err) {
        console.error('Server initialization error:', err);
    }
};

// Start the server if not in a testing environment
if (process.env.NODE_ENV !== 'test') {
    initializeServer();
}

module.exports = app; 