export enum ProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini'
}

export interface ApiKey {
  id: string;
  provider: ProviderType;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderConfig {
  name: string;
  icon: string;
  color: string;
  description: string;
  placeholder: string;
  helpUrl: string; // URL to provider's API key documentation
}