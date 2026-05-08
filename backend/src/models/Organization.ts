import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  domain: string;
  adminId: mongoose.Types.ObjectId;
  subscriptionStatus: string;
  createdAt: Date;
}

const OrganizationSchema: Schema = new Schema({
  name: { type: String, required: true },
  domain: { type: String, unique: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'User' },
  subscriptionStatus: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
