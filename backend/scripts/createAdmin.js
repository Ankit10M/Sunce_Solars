import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

// Import User model
import User from '../src/models/User.js';

const createAdmin = async () => {
  try {
    // Get arguments from command line
    const [, , name, email, password] = process.argv;

    // Validate inputs
    if (!name || !email || !password) {
      console.error(
        '\n❌ Usage: node scripts/createAdmin.js "<name>" "<email>" "<password>"\n'
      );
      console.error('Examples:');
      console.error('  node scripts/createAdmin.js "John Doe" "admin@sunce.admin.com" "SecurePass123"\n');
      process.exit(1);
    }

    // Validate email format
    if (!email.toLowerCase().endsWith('@sunce.admin.com')) {
      console.error('\n❌ Admin email must end with @sunce.admin.com\n');
      process.exit(1);
    }

    // Validate password length
    if (password.length < 8) {
      console.error('\n❌ Password must be at least 8 characters long\n');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.error(`❌ Admin account with email "${email}" already exists!\n`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Create admin user
    // NOTE: Password will be auto-hashed by User model's pre-save middleware
    console.log('👤 Creating admin account...');
    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: password, // Raw password - will be hashed by model middleware
      role: 'admin',
      isActive: true
    });

    console.log('\n✅ Admin account created successfully!\n');
    console.log('📋 Admin Details:');
    console.log('   Name:  ' + admin.name);
    console.log('   Email: ' + admin.email);
    console.log('   Role:  ' + admin.role);
    console.log('   ID:    ' + admin._id);
    console.log('\n🔓 Login Credentials:');
    console.log('   Email:    ' + email);
    console.log('   Password: ' + password);
    console.log('\n✨ You can now login at http://localhost:5173/login\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message, '\n');
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();
