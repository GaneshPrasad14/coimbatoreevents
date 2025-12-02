import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

const categories = [
    'Music',
    'Sports',
    'Workshop',
    'Fest',
    'Meetup',
    'Exhibition',
    'Concert',
    'Show'
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'event_management'
        });
        console.log('Connected to DB');

        for (const name of categories) {
            await Category.findOneAndUpdate(
                { name },
                { name },
                { upsert: true, new: true }
            );
            console.log(`Seeded category: ${name}`);
        }

        console.log('Categories seeded successfully');
    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedCategories();
