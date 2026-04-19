import { Request, Response } from 'express';

/**
 * Get API information
 * @route GET /api
 */
export const getApiInfo = (req: Request, res: Response): void => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.status(200).json({
    name: 'TypeScript Node.js API with Supabase PostgreSQL',
    version: '1.0.0',
    description: 'A REST API built with TypeScript, Node.js, and Supabase PostgreSQL',
    endpoints: {
      feedback: `${baseUrl}/api/feedback`,
      demo: `${baseUrl}/api/demo`,
    },
    documentation: `${baseUrl}/api/demo`,
    health: `${baseUrl}/health`
  });
};

/**
 * Get API status
 * @route GET /api/status
 */
export const getStatus = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};