import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import AdminUser from './models/AdminUser.js';

dotenv.config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('result.txt', msg + '\n');
};

const createAdmin = async () => {
    try {
        fs.writeFileSync('result.txt', 'Starting...\n');
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'event_management'
        });
        log('✅ Connected to MongoDB');

        const email = 'admin@coimbatore.events';
        const password = 'coimbatoreevents@2525';

        // Check if admin already exists
        const existingAdmin = await AdminUser.findOne({ email });
        if (existingAdmin) {
            log('⚠️ Admin user already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(password, salt);
            await existingAdmin.save();
            log('✅ Admin password updated successfully');
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new admin
            const newAdmin = new AdminUser({
                email,
                password: hashedPassword,
                role: 'super_admin',
                is_active: true
            });

            await newAdmin.save();
            log('✅ Admin user created successfully');
        }

        log(`📧 Email: ${email}`);
        log(`🔑 Password: ${password}`);

    } catch (error) {
        log('❌ Error creating admin user: ' + error.message);
        if (error.cause) log('Cause: ' + error.cause);
    } finally {
        await mongoose.disconnect();
        log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

createAdmin();
