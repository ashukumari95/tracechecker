import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User'; // Ensure path is correct

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Database Connection
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log("Connected to Neural Database...");

    // 2. Check if admin already exists by username
    const existingAdmin = await User.findOne({ username: 'rahul_admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin with username "rahul_admin" already exists!');
      process.exit();
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash('admin12345', 12);
    
    // 4. Create Admin Object with ALL required fields
    const admin = new User({
      name: 'Rahul Kumawat',
      username: 'rahul_admin', // 🚨 Fixed: Adding missing required field
      email: 'rahul_admin@tracechecker.io',
      password: hashedPassword,
      role: 'admin'
    });

    // 5. Save to MongoDB
    await admin.save();
    console.log('✅ Success: Neural Admin Created!');
    console.log('User: rahul_admin | Pass: admin12345');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();