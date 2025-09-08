import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface IUserDocument extends Document {
  email: string;
  apiKey: string;
  apiKeyHash: string;
  createdAt: Date;
  updatedAt: Date;
  compareApiKey(candidateKey: string): Promise<boolean>;
  generateApiKey(): string;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      select: false
    },
    apiKeyHash: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.compareApiKey = async function(candidateKey: string): Promise<boolean> {
  return bcrypt.compare(candidateKey, this.apiKeyHash);
};

userSchema.methods.generateApiKey = function(): string {
  const apiKey = `ak_${crypto.randomBytes(32).toString('hex')}`;
  this.apiKey = apiKey;
  return apiKey;
};

userSchema.pre('save', async function(next) {
  if (this.isModified('apiKey')) {
    this.apiKeyHash = await bcrypt.hash(this.apiKey, 12);
  }
  next();
});

export const User = mongoose.model<IUserDocument>('User', userSchema);