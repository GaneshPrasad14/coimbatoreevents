import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import AdminUser from './models/AdminUser.js';

dotenv.config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('unlock_result.txt', msg + '\n');
};

const unlockAdmin = async () => {
    try {
        fs.writeFileSync('unlock_result.txt', 'Starting unlock process...\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'event_management'
        });
        log('✅ Connected to MongoDB');

        const email = 'admin@coimbatore.events';

        const admin = await AdminUser.findOne({ email });

        if (!admin) {
            log('❌ Admin user not found');
            return;
        }

        log(`Found admin user: ${admin.email}`);
        log(`Current lock status: ${admin.lock_until ? 'LOCKED until ' + admin.lock_until : 'UNLOCKED'}`);
        log(`Login attempts: ${admin.login_attempts}`);

        // Reset lock and attempts
        admin.lock_until = null;
        admin.login_attempts = 0;

        await admin.save();

        log('✅ Admin account successfully unlocked!');
        log('Login attempts reset to 0');

    } catch (error) {
        log('❌ Error unlocking admin: ' + error.message);
    } finally {
        await mongoose.disconnect();
        log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

unlockAdmin();
