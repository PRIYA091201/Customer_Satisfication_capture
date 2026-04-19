import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import http from 'http';
import config from './config/config';
import routes from './routes/index';
import apiRoutes from './routes/api.routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import db from './utils/db';
import logger from './utils/logger';
import wsServer from './ws/websocket-server';

const app: Express = express();
const port = config.port;

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static('public'));

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the TypeScript Node.js API with Supabase PostgreSQL',
    demoUI: '/demo.html',
    apiDocs: '/api',
    apiDemo: '/api/demo'
  });
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const dbStatus = await db.checkDbConnection();
  
  res.status(200).json({
    status: 'OK',
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', apiRoutes);
app.use('/v1', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database
db.getSupabaseClient();

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
wsServer.initializeWebSocketServer(server);

// Start server
server.listen(port, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${port}`);
  logger.info('Initializing database connection...');
  
  db.checkDbConnection()
    .then(connected => {
      if (connected) {
        logger.info('Successfully connected to Supabase database');
      } else {
        logger.warn('Could not connect to Supabase database. Check your credentials.');
      }
    })
    .catch(err => {
      logger.error('Error connecting to database', err);
    });
});