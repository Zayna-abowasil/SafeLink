import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  scanId: Types.ObjectId;
  userId: Types.ObjectId;
  reason: 'Phishing' | 'Malware' | 'Inappropriate content';
  comments?: string;
  screenshotUrl?: string;
  status: 'Under Review' | 'Resolved';
  reportDate: Date;
}

const ReportSchema = new Schema<IReport>({
  scanId: { type: Schema.Types.ObjectId, ref: 'Scan', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { 
    type: String, 
    enum: ['Phishing', 'Malware', 'Inappropriate content'], 
    required: true 
  },
  comments: { type: String },
  screenshotUrl: { type: String },
  status: { 
    type: String, 
    enum: ['Under Review', 'Resolved'], 
    default: 'Under Review' 
  },
  reportDate: { type: Date, default: Date.now }
});

export const Report = model<IReport>('Report', ReportSchema);