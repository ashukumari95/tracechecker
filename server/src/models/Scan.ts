import mongoose, { Schema, Document } from 'mongoose';

// Interface update: added logs and synced status
export interface IScan extends Document {
  target: string;
  scanType: string;
  riskScore: number;
  leaksFound: number;
  activeProfiles: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed'; // Synced with Schema
  logs: Array<{
    time: string;
    type: 'OK' | 'INFO' | 'WARN';
    message: string;
  }>;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema: Schema = new Schema({
  target: { 
    type: String, 
    required: [true, 'Target identifier is required'],
    trim: true 
  },
  scanType: { 
    type: String, 
    default: 'Standard',
    enum: ['Standard', 'Deep Scan', 'Forensic']
  },
  riskScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100 
  },
  leaksFound: { 
    type: Number, 
    default: 0 
  },
  activeProfiles: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Processing', 'Completed', 'Failed'], // Valid enum
    default: 'Pending' 
  },
  // 🚨 NEW: Added logs field to store scan progress messages
  logs: [
    {
      time: { type: String },
      type: { type: String, enum: ['OK', 'INFO', 'WARN'] },
      message: { type: String }
    }
  ],
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false 
  }
}, { 
  timestamps: true 
});

// Indexing for faster history lookups
ScanSchema.index({ target: 1, createdAt: -1 });

export default mongoose.model<IScan>('Scan', ScanSchema);