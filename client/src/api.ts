import axios from 'axios';
import { API_BASE_URL } from './config';
import { ApiKey, User, ProviderType } from './types';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercept requests to add the API key header
api.interceptors.request.use((config) => {
  const userApiKey = localStorage.getItem('userApiKey');
  if (userApiKey) {
    config.headers['X-API-Key'] = userApiKey;
  }
  return config;
});

export const authApi = {
  register: async (email: string): Promise<User> => {
    const response = await api.post('/users/register', { email });
    // Handle both new registration and existing user
    return response.data.user;
  },
  
  getProfile: async (): Promise<Partial<User>> => {
    const response = await api.get('/users/profile');
    return response.data.user;
  }
};

export const keysApi = {
  list: async (): Promise<ApiKey[]> => {
    const response = await api.get('/keys');
    return response.data.apiKeys;
  },
  
  get: async (provider: ProviderType): Promise<{ provider: ProviderType; apiKey: string; lastUsed?: string; createdAt: string }> => {
    const response = await api.get(`/keys/${provider}`);
    return response.data;
  },
  
  create: async (provider: ProviderType, apiKey: string): Promise<void> => {
    await api.post('/keys', { provider, apiKey });
  },
  
  update: async (provider: ProviderType, apiKey: string): Promise<void> => {
    await api.put(`/keys/${provider}`, { apiKey });
  },
  
  delete: async (provider: ProviderType): Promise<void> => {
    await api.delete(`/keys/${provider}`);
  }
};