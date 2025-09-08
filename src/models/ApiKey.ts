import mongoose, { Document, Schema } from 'mongoose';
import { ProviderType } from '../types';

export interface IApiKeyDocument extends Document {
  userId: mongoose.Types.ObjectId;
  provider: ProviderType;
  encryptedKey: string;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKeyDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      enum: Object.values(ProviderType),
      required: true
    },
    encryptedKey: {
      type: String,
      required: true
    },
    lastUsed: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

apiKeySchema.index({ userId: 1, provider: 1 }, { unique: true });
apiKeySchema.index({ userId: 1 });

export const ApiKey = mongoose.model<IApiKeyDocument>('ApiKey', apiKeySchema);