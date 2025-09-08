import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/api-key-vault',
  encryptionKey: process.env.ENCRYPTION_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
};

export const validateConfig = (): void => {
  if (!config.encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  if (config.encryptionKey.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
  
  if (config.nodeEnv === 'production' && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required in production');
  }
};