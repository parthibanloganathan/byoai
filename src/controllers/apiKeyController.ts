import { Response } from 'express';
import { ApiKey } from '../models/ApiKey';
import { AuthRequest, ProviderType } from '../types';
import { encryptApiKey, decryptApiKey } from '../utils/encryption';
import mongoose from 'mongoose';

export const createApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { provider, apiKey } = req.body;
    const userId = req.userId!;
    
    const existingKey = await ApiKey.findOne({ 
      userId: new mongoose.Types.ObjectId(userId), 
      provider 
    });
    
    if (existingKey) {
      res.status(409).json({ error: `API key for ${provider} already exists` });
      return;
    }
    
    const encryptedKey = encryptApiKey(apiKey);
    
    const newApiKey = new ApiKey({
      userId: new mongoose.Types.ObjectId(userId),
      provider,
      encryptedKey
    });
    
    await newApiKey.save();
    
    res.status(201).json({
      message: 'API key stored successfully',
      provider,
      id: newApiKey._id
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ error: 'Failed to store API key' });
  }
};

export const getApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;
    const userId = req.userId!;
    
    const apiKey = await ApiKey.findOne({ 
      userId: new mongoose.Types.ObjectId(userId), 
      provider: provider as ProviderType 
    });
    
    if (!apiKey) {
      res.status(404).json({ error: `API key for ${provider} not found` });
      return;
    }
    
    const decryptedKey = decryptApiKey(apiKey.encryptedKey);
    
    await ApiKey.findByIdAndUpdate(apiKey._id, { lastUsed: new Date() });
    
    res.json({
      provider: apiKey.provider,
      apiKey: decryptedKey,
      lastUsed: apiKey.lastUsed,
      createdAt: apiKey.createdAt
    });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({ error: 'Failed to retrieve API key' });
  }
};

export const updateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;
    const { apiKey } = req.body;
    const userId = req.userId!;
    
    const encryptedKey = encryptApiKey(apiKey);
    
    const updatedKey = await ApiKey.findOneAndUpdate(
      { 
        userId: new mongoose.Types.ObjectId(userId), 
        provider: provider as ProviderType 
      },
      { encryptedKey },
      { new: true }
    );
    
    if (!updatedKey) {
      res.status(404).json({ error: `API key for ${provider} not found` });
      return;
    }
    
    res.json({
      message: 'API key updated successfully',
      provider: updatedKey.provider,
      updatedAt: updatedKey.updatedAt
    });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
};

export const deleteApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;
    const userId = req.userId!;
    
    const deletedKey = await ApiKey.findOneAndDelete({ 
      userId: new mongoose.Types.ObjectId(userId), 
      provider: provider as ProviderType 
    });
    
    if (!deletedKey) {
      res.status(404).json({ error: `API key for ${provider} not found` });
      return;
    }
    
    res.json({
      message: 'API key deleted successfully',
      provider
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
};

export const listApiKeys = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    
    const apiKeys = await ApiKey.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).select('-encryptedKey');
    
    res.json({
      apiKeys: apiKeys.map(key => ({
        id: key._id,
        provider: key.provider,
        lastUsed: key.lastUsed,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt
      }))
    });
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({ error: 'Failed to list API keys' });
  }
};