import { Request, Response } from 'express';
import { User } from '../models/User';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email }).select('+apiKey');
    if (existingUser) {
      // Return existing user's API key for seamless experience
      res.status(200).json({
        message: 'User already exists',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          apiKey: existingUser.apiKey
        }
      });
      return;
    }
    
    const user = new User({ email });
    const apiKey = user.generateApiKey();
    await user.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        apiKey: apiKey
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const getProfile = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};