import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  scanId: mongoose.Types.ObjectId; // Kis scan se linked hai
  platform: string;               // e.g., 'Instagram', 'GitHub', 'LinkedIn'
  username: string;               // Found username
  url: string;                    // Profile direct link
  status: 'Found' | 'Private' | 'Suspicious'; 
  metadata?: Record<string, any>; // Extra data (bio, followers, etc.)
  createdAt: Date;
}

const ProfileSchema: Schema = new Schema({
  scanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Scan', 
    required: true 
  },
  platform: { 
    type: String, 
    required: true,
    trim: true
  },
  username: { 
    type: String, 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Found', 'Private', 'Suspicious'], 
    default: 'Found' 
  },
  metadata: { 
    type: Map, 
    of: Schema.Types.Mixed 
  }
}, { 
  timestamps: true 
});

// Indexing for faster lookups by scan
ProfileSchema.index({ scanId: 1 });

export default mongoose.model<IProfile>('Profile', ProfileSchema);