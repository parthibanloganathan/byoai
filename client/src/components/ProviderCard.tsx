import React, { useState, useEffect } from 'react';
import { ProviderType, ApiKey } from '../types';
import { PROVIDER_CONFIGS, maskApiKey } from '../config';
import { keysApi } from '../api';

interface ProviderCardProps {
  provider: ProviderType;
  apiKey?: ApiKey;
  onUpdate: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, apiKey, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  
  const config = PROVIDER_CONFIGS[provider];
  const hasKey = !!apiKey;

  useEffect(() => {
    let isMounted = true;
    
    if (hasKey && !maskedKey) {
      // Fetch the key to get a preview
      keysApi.get(provider)
        .then(response => {
          if (isMounted) {
            setMaskedKey(maskApiKey(response.apiKey));
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error('Failed to fetch key preview:', err);
            // Set a default masked value on error
            setMaskedKey('••••••••');
          }
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [hasKey, provider, maskedKey]);

  const getLogoPath = () => {
    switch (provider) {
      case ProviderType.OPENAI:
        return '/images/openai_logo.svg';
      case ProviderType.ANTHROPIC:
        return '/images/anthropic_logo.svg';
      case ProviderType.GEMINI:
        return '/images/gemini_logo.svg';
      default:
        return '';
    }
  };

  const handleSave = async () => {
    if (!newKey.trim()) return;
    
    setIsLoading(true);
    try {
      if (hasKey) {
        await keysApi.update(provider, newKey);
      } else {
        await keysApi.create(provider, newKey);
      }
      setIsEditing(false);
      setNewKey('');
      setMaskedKey(null); // Reset to fetch new key
      onUpdate();
    } catch (error: any) {
      console.error('Failed to save API key:', error);
      alert(`Error: ${error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || error.message || 'Failed to save API key'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove your ${config.name} API key?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await keysApi.delete(provider);
      setMaskedKey(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete API key:', error);
      alert('Failed to delete API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img 
              src={getLogoPath()} 
              alt={`${config.name} logo`}
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
            {hasKey && apiKey?.lastUsed && (
              <p className="text-xs text-gray-400 mt-1">
                Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {hasKey ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Not connected
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder={config.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key will be encrypted and stored securely.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading || !newKey.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNewKey('');
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : hasKey ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
            <code className="text-sm text-gray-700 font-mono">
              {maskedKey || 'Loading...'}
            </code>
            <span className="text-xs text-gray-400">Encrypted</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Update Key
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 bg-red-50 text-red-700 py-2 px-4 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-2 text-sm">No API key configured</p>
          <p className="text-xs text-gray-400 mb-4">
            <a 
              href={config.helpUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Where to find your {config.name} API key
            </a>
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add API Key
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderCard;