import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { authApi } from './api';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Get email from URL parameters (passed by parent app)
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        
        if (!email) {
          throw new Error('No email provided in URL parameters');
        }

        // Check if user already exists in localStorage
        const storedApiKey = localStorage.getItem('userApiKey');
        const storedEmail = localStorage.getItem('userEmail');
        
        if (storedApiKey && storedEmail === email) {
          // User already registered, verify the API key is still valid
          try {
            await authApi.getProfile();
            setUserEmail(email);
          } catch {
            // API key invalid, need to re-register
            localStorage.removeItem('userApiKey');
            localStorage.removeItem('userEmail');
            await registerUser(email);
          }
        } else {
          // New user or different email, register
          await registerUser(email);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize user');
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const registerUser = async (email: string) => {
      try {
        const response = await authApi.register(email);
        // Store API key whether it's a new user or existing
        localStorage.setItem('userApiKey', response.apiKey);
        localStorage.setItem('userEmail', email);
        setUserEmail(email);
      } catch (err: any) {
        console.error('Registration failed:', err);
        // Check if it's a network error or server error
        if (err.response?.status === 500 || !err.response) {
          throw new Error('Failed to connect to server. Please try again.');
        }
        throw new Error('Failed to register user. Please contact support.');
      }
    };

    initializeUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Initialization Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Required
            </h2>
            <p className="text-gray-600">
              Please access this component through your application.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard userEmail={userEmail} />;
};

export default App;