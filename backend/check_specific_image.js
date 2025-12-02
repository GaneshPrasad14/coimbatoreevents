import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

const checkSpecificImage = async () => {
    await connectDB();
    const logPath = path.join(__dirname, 'db_check_result.txt');
    let output = '';

    try {
        const eventsCollection = mongoose.connection.db.collection('events');

        // Look for any event with the new image
        const targetImage = '/uploads/optimized/optimized_1764592236914_IMG_3466.PNG';
        const event = await eventsCollection.findOne({ image: targetImage });

        if (event) {
            output += 'FOUND: Event has the new image.\n';
            output += `Event ID: ${event._id}\n`;
            output += `Title: ${event.title}\n`;
            output += `Image: ${event.image}\n`;
        } else {
            output += 'NOT FOUND: No event has the new image.\n';

            // List all events and their images to see what's there
            const allEvents = await eventsCollection.find({}).toArray();
            output += '\nCurrent State of Events:\n';
            allEvents.forEach(e => {
                output += `ID: ${e._id}, Title: ${e.title}\n`;
                output += `   image: ${e.image}\n`;
                output += `   image_url: ${e.image_url}\n`;
            });
        }

        fs.writeFileSync(logPath, output);
        console.log('Results written to db_check_result.txt');

    } catch (error) {
        console.error('Error checking events:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkSpecificImage();
