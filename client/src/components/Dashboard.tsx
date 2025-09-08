import React, { useState, useEffect } from 'react';
import { ApiKey, ProviderType } from '../types';
import { keysApi } from '../api';
import ProviderCard from './ProviderCard';

interface DashboardProps {
  userEmail: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userEmail }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = async () => {
    try {
      setError(null);
      const keys = await keysApi.list();
      setApiKeys(keys);
    } catch (err) {
      setError('Failed to load API keys');
      console.error('Error fetching API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const getApiKeyForProvider = (provider: ProviderType): ApiKey | undefined => {
    return apiKeys.find(key => key.provider === provider);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <div className="text-red-600 text-center">
            <p className="text-lg font-medium mb-2">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchApiKeys}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI API Key Manager
            </h1>
            <p className="text-gray-600">
              Manage your API keys for OpenAI, Anthropic, and Google Gemini
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Connected as: {userEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {Object.values(ProviderType).map((provider) => (
            <ProviderCard
              key={provider}
              provider={provider}
              apiKey={getApiKeyForProvider(provider)}
              onUpdate={fetchApiKeys}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Your API keys are encrypted and stored securely.</p>
          <p className="mt-1">Only you have access to view and manage them.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;