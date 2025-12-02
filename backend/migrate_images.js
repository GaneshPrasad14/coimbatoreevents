import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        const dbName = process.env.DB_NAME || 'event_management';
        console.log(`Connecting to MongoDB... (DB: ${dbName})`);
        await mongoose.connect(uri, { dbName });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const migrateImages = async () => {
    await connectDB();

    try {
        const eventsCollection = mongoose.connection.db.collection('events');

        // Find events that need migration
        const eventsToMigrate = await eventsCollection.find({
            $and: [
                { image_url: { $exists: true, $ne: '' } },
                { $or: [{ image: { $exists: false } }, { image: '' }] }
            ]
        }).toArray();

        console.log(`Found ${eventsToMigrate.length} events to migrate.`);

        if (eventsToMigrate.length === 0) {
            console.log('No migration needed.');
            return;
        }

        let migratedCount = 0;
        for (const event of eventsToMigrate) {
            await eventsCollection.updateOne(
                { _id: event._id },
                { $set: { image: event.image_url } }
            );
            migratedCount++;
            console.log(`Migrated event ${event._id}: ${event.image_url} -> image`);
        }

        console.log(`Successfully migrated ${migratedCount} events.`);

    } catch (error) {
        console.error('Error migrating events:', error);
    } finally {
        mongoose.connection.close();
    }
};

migrateImages();
