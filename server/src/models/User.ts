// src/models/User.ts
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }, // Isse 'admin' hi rakho
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);