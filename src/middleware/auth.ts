import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { AuthRequest } from '../types';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      res.status(401).json({ error: 'API key is required' });
      return;
    }
    
    const user = await User.findOne({ apiKey }).select('+apiKey +apiKeyHash');
    
    if (!user) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    
    const isValid = await user.compareApiKey(apiKey);
    
    if (!isValid) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    
    req.userId = (user._id as mongoose.Types.ObjectId).toString();
    req.apiKey = apiKey;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};