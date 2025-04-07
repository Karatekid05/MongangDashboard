const mongoose = require('mongoose');
require('dotenv').config();

async function analyzeDb() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongang';
        console.log('Connecting to MongoDB...');
        console.log('URI:', mongoURI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')); // Hide credentials

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB database:', mongoose.connection.db.databaseName);

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nAvailable collections:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        // Count documents in each collection
        console.log('\nDocument counts:');
        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`- ${collection.name}: ${count} documents`);

            if (count > 0) {
                // Get sample document from collection
                const sample = await mongoose.connection.db.collection(collection.name)
                    .findOne({});

                console.log(`  Sample document keys: ${Object.keys(sample).join(', ')}`);

                if (collection.name === 'gangs') {
                    console.log('  Gang Sample:', {
                        id: sample._id,
                        name: sample.name,
                        gangId: sample.gangId,
                        guildId: sample.guildId,
                        totalMemberPoints: sample.totalMemberPoints,
                        weeklyMemberPoints: sample.weeklyMemberPoints
                    });
                } else if (collection.name === 'users') {
                    console.log('  User Sample:', {
                        id: sample._id,
                        username: sample.username,
                        discordId: sample.discordId,
                        currentGangId: sample.currentGangId,
                        points: sample.points
                    });
                }
            }
        }

        // Check if collections are using the correct names
        const requiredCollections = ['gangs', 'users', 'activitylogs'];
        const missingCollections = requiredCollections.filter(
            reqColl => !collections.some(coll => coll.name.toLowerCase() === reqColl)
        );

        if (missingCollections.length > 0) {
            console.log('\n⚠️ MISSING COLLECTIONS:', missingCollections.join(', '));
            console.log('The dashboard is looking for these collections. Check if they have different names.');
        }

        console.log('\nAnalysis complete.');
    } catch (error) {
        console.error('Error analyzing database:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

// Run the analysis
analyzeDb(); 