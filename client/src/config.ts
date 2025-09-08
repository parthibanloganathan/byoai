import { ProviderType, ProviderConfig } from './types';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const PROVIDER_CONFIGS: Record<ProviderType, ProviderConfig> = {
  [ProviderType.OPENAI]: {
    name: 'OpenAI',
    icon: '',
    color: 'text-green-600',
    description: 'GPT models, DALL-E, and more',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/account/api-keys'
  },
  [ProviderType.ANTHROPIC]: {
    name: 'Anthropic',
    icon: '',
    color: 'text-orange-600',
    description: 'Claude AI models',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys'
  },
  [ProviderType.GEMINI]: {
    name: 'Google Gemini',
    icon: '',
    color: 'text-blue-600',
    description: 'Gemini AI models',
    placeholder: 'AIza...',
    helpUrl: 'https://aistudio.google.com/app/apikey'
  }
};

export const maskApiKey = (key: string): string => {
  if (!key) return '';
  if (key.length <= 8) return key;
  
  // Get the prefix (before first dash) and last 4 characters
  const parts = key.split('-');
  const prefix = parts[0] + (parts.length > 1 ? '-' : '');
  const suffix = key.slice(-4);
  
  return `${prefix}...${suffix}`;
};