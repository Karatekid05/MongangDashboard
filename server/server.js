const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import Discord bot
let discordBot;
try {
    discordBot = require('./bot/discordBot');
    console.log('Discord bot module loaded');
} catch (error) {
    console.error('Failed to load Discord bot module:', error.message);
    discordBot = { startBot: () => console.log('Mock startBot called') };
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const gangRoutes = require('./routes/gangs');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activity');
const leaderboardRoutes = require('./routes/leaderboard');

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
            syncDiscord: '/api/sync-discord',
            debug: '/api/debug'
        }
    });
});

// Force sync with Discord data
app.get('/api/sync-discord', async (req, res) => {
    try {
        if (discordBot && typeof discordBot.syncGuildData === 'function') {
            // Start sync process
            await discordBot.syncGuildData();
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

// Debug endpoint to check database
app.get('/api/debug', async (req, res) => {
    try {
        // Get all collection names
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log('Available collections:', collectionNames);

        // Get sample data from each collection
        const sampleData = {};
        for (const collectionName of collectionNames) {
            const sample = await mongoose.connection.db.collection(collectionName)
                .find({})
                .limit(1)
                .toArray();

            sampleData[collectionName] = sample.length > 0 ? sample[0] : null;
            console.log(`Sample from ${collectionName}:`, sample.length > 0 ? 'Data found' : 'No data');
        }

        // Count documents in each collection
        const counts = {};
        for (const collectionName of collectionNames) {
            counts[collectionName] = await mongoose.connection.db.collection(collectionName).countDocuments();
        }

        res.json({
            connected: mongoose.connection.readyState === 1,
            database: mongoose.connection.db.databaseName,
            collections: collectionNames,
            counts: counts,
            sampleData: sampleData
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking database',
            error: error.message
        });
    }
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        // Para desenvolvimento local, podemos usar um MongoDB local se necessário
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongang';

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
        console.log('Connected to database:', mongoose.connection.db.databaseName);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        // Start Discord bot after successful MongoDB connection
        if (discordBot && typeof discordBot.startBot === 'function' &&
            process.env.DISCORD_BOT_TOKEN && process.env.GUILD_ID) {
            discordBot.startBot();
            console.log('Discord bot initialization requested');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.log('Tentando continuar mesmo sem conexão ao MongoDB...');
        // Não saímos para permitir que o servidor inicie mesmo sem DB
    }
};

connectDB();

// API Routes
app.use('/api/gangs', gangRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        dbConnected: mongoose.connection.readyState === 1,
        botLoaded: !!discordBot && typeof discordBot.startBot === 'function'
    });
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
