import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  apiKey?: string;
}

export enum ProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini'
}

export interface IUser {
  _id: string;
  email: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApiKey {
  _id: string;
  userId: string;
  provider: ProviderType;
  encryptedKey: string;
  createdAt: Date;
  updatedAt: Date;
}