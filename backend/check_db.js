import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME || 'event_management'
})
    .then(async () => {
        console.log('Connected to MongoDB');
        const events = await Event.find().sort({ createdAt: -1 }).limit(1);
        console.log('Most Recent Event:');
        events.forEach(event => {
            console.log(JSON.stringify({
                id: event._id,
                title: event.title,
                image_url: event.image_url
            }, null, 2));
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
