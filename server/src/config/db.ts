import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://aashukumari2211_db_user:traceChecker@cluster0.ef9poit.mongodb.net/?appName=Cluster0';
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`🛡️ TraceChecker DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;