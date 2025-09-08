import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, validateConfig } from './config/config';
import { connectDB } from './config/database';
import { globalRateLimiter } from './middleware/rateLimiter';
import userRoutes from './routes/userRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';

const app = express();

const startServer = async (): Promise<void> => {
  try {
    validateConfig();
    
    await connectDB();
    
    // Use minimal helmet configuration to avoid CSP issues
    app.use(helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));
    app.use(cors(config.cors));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.use(globalRateLimiter);
    
    app.get('/health', (_req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    
    app.use('/api/users', userRoutes);
    app.use('/api/keys', apiKeyRoutes);
    
    app.use((_req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
    
    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();