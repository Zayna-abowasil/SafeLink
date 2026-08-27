import { Schema, model, Document, Types } from 'mongoose';

export interface IScan extends Document {
  userId: Types.ObjectId;
  url: string;
  riskScore: number;
  classification: 'Safe' | 'Suspicious' | 'Malicious';
  threatIndicators: string[];
  aiExplanation: string;
  status: 'Completed' | 'Under Review';
  scanDate: Date;
}

const ScanSchema = new Schema<IScan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  riskScore: { type: Number, required: true },
  classification: { 
    type: String, 
    enum: ['Safe', 'Suspicious', 'Malicious'], 
    required: true 
  },
  threatIndicators: [{ type: String }],
  aiExplanation: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Completed', 'Under Review'], 
    default: 'Completed' 
  },
  scanDate: { type: Date, default: Date.now }
});

export const Scan = model<IScan>('Scan', ScanSchema);