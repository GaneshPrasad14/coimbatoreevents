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
        console.log(`Connecting to MongoDB... (URI length: ${uri ? uri.length : 0}, DB: ${dbName})`);
        await mongoose.connect(uri, { dbName });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const checkEvents = async () => {
    await connectDB();

    try {
        const eventsCollection = mongoose.connection.db.collection('events');
        const count = await eventsCollection.countDocuments();
        console.log(`Raw count in 'events' collection: ${count}`);

        const events = await eventsCollection.find({}).toArray();
        console.log(`Found ${events.length} events.`);

        let missingImageCount = 0;
        events.forEach(event => {
            if (!event.image && event.image_url) {
                missingImageCount++;
                console.log(`Event ID: ${event._id} needs migration.`);
                console.log(`  image_url: ${event.image_url}`);
            }
        });

        console.log(`Total events needing migration: ${missingImageCount}`);

    } catch (error) {
        console.error('Error checking events:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkEvents();
