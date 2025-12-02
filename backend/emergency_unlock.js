import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import AdminUser from './models/AdminUser.js';

dotenv.config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('unlock_log.txt', msg + '\n');
};

const emergencyUnlock = async () => {
    try {
        fs.writeFileSync('unlock_log.txt', 'Starting emergency unlock...\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'event_management'
        });
        log('✅ Connected to MongoDB');

        const email = 'admin@coimbatore.events';

        // Update directly to bypass any hooks
        const result = await AdminUser.updateOne(
            { email },
            {
                $set: {
                    lock_until: null,
                    login_attempts: 0
                }
            }
        );

        if (result.matchedCount === 0) {
            log('❌ Admin user not found');
        } else {
            log('✅ Admin account UNLOCKED successfully');
            log(`Modified count: ${result.modifiedCount}`);
        }

    } catch (error) {
        log('❌ Error: ' + error.message);
    } finally {
        await mongoose.disconnect();
        log('👋 Disconnected');
        process.exit(0);
    }
};

emergencyUnlock();
