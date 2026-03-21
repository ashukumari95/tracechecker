import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User'; // Path check kar lena
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tracechecker');
    console.log("Connected to DB...");

    // 2. Check if Admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log("Admin already exists in Database!");
      process.exit();
    }

    // 3. Credentials set karo
    const adminUsername = "rahul_admin";
    const plainPassword = "Admin@Trace#2026"; // ⚠️ Apna password yahan badal lo
    
    // 4. Hash the password (Security)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 5. Create Admin User
    const newAdmin = new User({
      username: adminUsername,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    console.log("-----------------------------------------");
    console.log("✅ SUCCESS: Admin User Created!");
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${plainPassword}`);
    console.log("-----------------------------------------");

    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();