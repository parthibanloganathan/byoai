# API Key Vault - Developer Integration Guide

A secure, self-hosted API key management service for OpenAI, Anthropic, and Google Gemini. This allows your users to securely store their AI API keys and your application to access them when needed.

## 🚀 Quick Start

**Prefer Docker?** Jump to [One-Click Docker Deployment](#-one-click-docker-deployment) ⬇️

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- npm or yarn

### Manual Installation
```bash
git clone <repository-url>
cd api-key-vault
npm install
cd client && npm install && cd ..

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Start the services
npm run dev          # API server (port 3000)
cd client && npm start  # UI component (port 3001)
```

## 🐳 One-Click Docker Deployment

### Super Simple Start (Recommended)
```bash
git clone <repository-url>
cd api-key-vault
./start.sh
```
That's it! The script will:
- ✅ Check Docker installation
- ✅ Generate secure encryption keys
- ✅ Start all services
- ✅ Show you the URLs

**Don't have Docker?** [Install Docker Desktop](https://docs.docker.com/get-docker/) first, or use the [Manual Installation](#manual-installation) method above.

### Manual Production Deployment
```bash
git clone <repository-url>
cd api-key-vault

# Generate a secure encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy and configure environment
cp .env.docker .env
# Edit .env and set your ENCRYPTION_KEY

# One-click deployment
docker-compose up -d

# Access the application
# API: http://localhost:3000
# UI: http://localhost:3001
```

### Development with Hot Reload
```bash
# Start development environment with auto-reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f
```

### Docker Commands
```bash
# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# View service status
docker-compose ps

# Rebuild after code changes
docker-compose up -d --build
```

---

## 📖 Table of Contents

1. [Docker Deployment](#-one-click-docker-deployment)
2. [API Authentication](#api-authentication)
3. [User Registration](#user-registration)  
4. [Accessing API Keys](#accessing-api-keys)
5. [Integration Examples](#integration-examples)
6. [UI Component Embedding](#ui-component-embedding)
7. [Security Best Practices](#security-best-practices)
8. [Deployment Guide](#deployment-guide)

---

## 🔐 API Authentication

All API requests require an API key in the `X-API-Key` header. Each user gets a unique API key when they register.

```javascript
const headers = {
  'X-API-Key': 'ak_user_api_key_here',
  'Content-Type': 'application/json'
};
```

---

## 👤 User Registration

### Register a New User

**Endpoint:** `POST /api/users/register`

```javascript
// Register a new user
const response = await fetch('http://your-api-url/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const data = await response.json();
console.log(data);
// {
//   "message": "User registered successfully",
//   "user": {
//     "id": "...",
//     "email": "user@example.com", 
//     "apiKey": "ak_..." // SAVE THIS - only shown once!
//   }
// }
```

**⚠️ Important:** Store the returned API key securely - it's only returned once!

### Get User Profile

**Endpoint:** `GET /api/users/profile`

```javascript
const response = await fetch('http://your-api-url/api/users/profile', {
  headers: { 'X-API-Key': 'ak_user_api_key' }
});
```

---

## 🗝️ Accessing API Keys

### Retrieve a Specific Provider's API Key

**Endpoint:** `GET /api/keys/:provider`

Supported providers: `openai`, `anthropic`, `gemini`

```javascript
// Get OpenAI API key for a user
async function getOpenAIKey(userApiKey) {
  const response = await fetch('http://your-api-url/api/keys/openai', {
    headers: { 'X-API-Key': userApiKey }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.apiKey; // The actual OpenAI API key
  }
  return null; // User hasn't configured OpenAI key
}

// Usage
const openaiKey = await getOpenAIKey('ak_user_api_key');
if (openaiKey) {
  // Use the key with OpenAI API
  console.log('OpenAI key:', openaiKey); // sk-...
}
```

### List All User's API Keys

**Endpoint:** `GET /api/keys`

```javascript
async function getUserAPIKeys(userApiKey) {
  const response = await fetch('http://your-api-url/api/keys', {
    headers: { 'X-API-Key': userApiKey }
  });
  
  const data = await response.json();
  return data.apiKeys;
  // [
  //   {
  //     "id": "...",
  //     "provider": "openai",
  //     "lastUsed": "2024-01-15T10:30:00Z",
  //     "createdAt": "2024-01-10T09:00:00Z"
  //   }
  // ]
}
```

---

## 💡 Integration Examples

### Example 1: Chat Application with Multiple Providers

```javascript
class AIService {
  constructor() {
    this.apiBaseUrl = 'http://your-api-vault-url/api';
  }

  async getProviderKey(userApiKey, provider) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/keys/${provider}`, {
        headers: { 'X-API-Key': userApiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.apiKey;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get ${provider} key:`, error);
      return null;
    }
  }

  async chatWithOpenAI(userApiKey, message) {
    const openaiKey = await this.getProviderKey(userApiKey, 'openai');
    if (!openaiKey) {
      throw new Error('User has no OpenAI API key configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }]
      })
    });

    return await response.json();
  }

  async chatWithAnthropic(userApiKey, message) {
    const anthropicKey = await this.getProviderKey(userApiKey, 'anthropic');
    if (!anthropicKey) {
      throw new Error('User has no Anthropic API key configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: message }]
      })
    });

    return await response.json();
  }
}

// Usage in your app
const aiService = new AIService();

app.post('/chat', async (req, res) => {
  const { userApiKey, message, provider } = req.body;
  
  try {
    let response;
    switch (provider) {
      case 'openai':
        response = await aiService.chatWithOpenAI(userApiKey, message);
        break;
      case 'anthropic':
        response = await aiService.chatWithAnthropic(userApiKey, message);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }
    
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Example 2: Express.js Middleware

```javascript
// middleware/apiKeys.js
const getProviderKey = async (userApiKey, provider) => {
  const response = await fetch(`${process.env.API_VAULT_URL}/api/keys/${provider}`, {
    headers: { 'X-API-Key': userApiKey }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.apiKey;
  }
  return null;
};

const requireProviderKey = (provider) => {
  return async (req, res, next) => {
    const userApiKey = req.headers['x-user-api-key'];
    
    if (!userApiKey) {
      return res.status(401).json({ error: 'User API key required' });
    }
    
    const providerKey = await getProviderKey(userApiKey, provider);
    if (!providerKey) {
      return res.status(400).json({ 
        error: `User has no ${provider} API key configured` 
      });
    }
    
    req.providerApiKey = providerKey;
    next();
  };
};

// Usage
app.post('/openai-completion', requireProviderKey('openai'), async (req, res) => {
  // req.providerApiKey now contains the user's OpenAI API key
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${req.providerApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });
  
  const data = await response.json();
  res.json(data);
});
```

### Example 3: React Hook for Frontend

```javascript
// hooks/useAPIKeys.js
import { useState, useEffect } from 'react';

export const useAPIKeys = (userApiKey) => {
  const [keys, setKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys', {
        headers: { 'X-API-Key': userApiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        const keyMap = {};
        data.apiKeys.forEach(key => {
          keyMap[key.provider] = key;
        });
        setKeys(keyMap);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProviderKey = async (provider) => {
    try {
      const response = await fetch(`/api/keys/${provider}`, {
        headers: { 'X-API-Key': userApiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.apiKey;
      }
    } catch (err) {
      console.error(`Failed to get ${provider} key:`, err);
    }
    return null;
  };

  useEffect(() => {
    if (userApiKey) {
      fetchKeys();
    }
  }, [userApiKey]);

  return { keys, loading, error, getProviderKey, refetch: fetchKeys };
};

// Usage in component
function ChatComponent({ userApiKey }) {
  const { keys, getProviderKey } = useAPIKeys(userApiKey);

  const handleOpenAIChat = async (message) => {
    const openaiKey = await getProviderKey('openai');
    if (!openaiKey) {
      alert('Please configure your OpenAI API key first');
      return;
    }
    
    // Use openaiKey to make API call...
  };

  return (
    <div>
      {keys.openai ? (
        <button onClick={() => handleOpenAIChat('Hello')}>
          Chat with OpenAI
        </button>
      ) : (
        <p>Configure OpenAI key to enable chat</p>
      )}
    </div>
  );
}
```

---

## 🎨 UI Component Embedding

### Basic Iframe Embedding

```html
<!-- Embed the API key manager in your app -->
<iframe 
  src="http://your-vault-url:3001?email=user@example.com"
  width="800" 
  height="600"
  style="border: none; border-radius: 8px;">
</iframe>
```

### Advanced Embedding with JavaScript

```javascript
// Create a popup modal for key management
function openAPIKeyManager(userEmail) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 1000; display: flex;
    align-items: center; justify-content: center;
  `;
  
  const iframe = document.createElement('iframe');
  iframe.src = `http://your-vault-url:3001?email=${userEmail}`;
  iframe.style.cssText = `
    width: 90%; max-width: 800px; height: 80%; max-height: 600px;
    border: none; border-radius: 12px; background: white;
  `;
  
  modal.appendChild(iframe);
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Usage
document.getElementById('manage-keys-btn').addEventListener('click', () => {
  openAPIKeyManager('user@example.com');
});
```

### React Component Wrapper

```javascript
// components/APIKeyManager.jsx
import { useState } from 'react';

export const APIKeyManager = ({ userEmail, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Manage API Keys
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-3/4 relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <iframe
          src={`http://your-vault-url:3001?email=${userEmail}`}
          className="w-full h-full rounded-lg"
          frameBorder="0"
        />
      </div>
    </div>
  );
};
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# .env
API_VAULT_URL=https://your-secure-domain.com
ENCRYPTION_KEY=your-super-long-encryption-key-here
MONGODB_URI=mongodb://localhost:27017/api-key-vault
```

### 2. HTTPS Only
```javascript
// Only allow HTTPS in production
if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
  return res.redirect(`https://${req.headers.host}${req.url}`);
}
```

### 3. Rate Limiting
The API includes built-in rate limiting:
- 100 requests per 15 minutes (global)
- 5 registration attempts per 15 minutes
- 10 API key retrievals per minute

### 4. User API Key Storage
```javascript
// ❌ Don't store in localStorage (XSS risk)
localStorage.setItem('userApiKey', key);

// ✅ Store in secure HTTP-only cookie
res.cookie('userApiKey', key, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});
```

---

## 🚀 Deployment Guide

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-mongo-server:27017/api-key-vault
ENCRYPTION_KEY=your-production-encryption-key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    restart: always
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  api:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/api-key-vault?authSource=admin
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - mongodb

  frontend:
    build: ./client
    restart: always
    ports:
      - "3001:3001"
    environment:
      - REACT_APP_API_URL=https://your-api-domain.com/api

volumes:
  mongo-data:
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/api-vault
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend UI
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🐛 Error Handling

### Common API Errors

```javascript
// Handle API errors gracefully
async function safeGetProviderKey(userApiKey, provider) {
  try {
    const response = await fetch(`/api/keys/${provider}`, {
      headers: { 'X-API-Key': userApiKey }
    });

    if (response.status === 401) {
      throw new Error('Invalid user API key');
    }
    
    if (response.status === 404) {
      return null; // User hasn't configured this provider
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.apiKey;
    
  } catch (error) {
    console.error(`Failed to get ${provider} key:`, error);
    throw error;
  }
}
```

### Validation Errors

```javascript
// API keys must match provider formats
const API_KEY_FORMATS = {
  openai: /^sk-[a-zA-Z0-9]{20,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9]{20,}$/,
  gemini: /^AIza[a-zA-Z0-9]{20,}$/
};

function validateAPIKey(provider, key) {
  const format = API_KEY_FORMATS[provider];
  return format && format.test(key);
}
```

---

## 📊 API Reference

### Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register new user | No |
| GET | `/users/profile` | Get user profile | Yes |
| GET | `/keys` | List user's API keys | Yes |
| POST | `/keys` | Store new API key | Yes |
| GET | `/keys/:provider` | Get specific provider key | Yes |
| PUT | `/keys/:provider` | Update provider key | Yes |
| DELETE | `/keys/:provider` | Delete provider key | Yes |
| GET | `/health` | Health check | No |

### Response Formats

**Success Response:**
```json
{
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## ❓ Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Security**: Report security issues privately

For questions about integration, check the examples above or open an issue!

---

**Made with ❤️ for secure AI API key management**