import WebSocket from 'ws';
import http from 'http';
import { Server } from 'http';
import logger from '../utils/logger';
import feedbackService from '../services/feedback.service';

// WebSocket clients connection store
const clients = new Map<string, WebSocket>();
let wsServer: WebSocket.Server | null = null;

/**
 * Initialize WebSocket server
 * @param server HTTP server instance
 */
export function initializeWebSocketServer(server: Server) {
  wsServer = new WebSocket.Server({ server });

  wsServer.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    // Generate a unique client ID
    const clientId = generateClientId();
    clients.set(clientId, ws);

    logger.info(`WebSocket client connected: ${clientId}`);

    // Send initial welcome message
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to feedback server', clientId }));

    // Set up event handlers
    ws.on('message', (message: string) => handleMessage(message, clientId, ws));
    ws.on('close', () => handleDisconnection(clientId));
    ws.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}:`, error);
    });

    // Set up a ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  // Set up Supabase subscription for feedback changes
  setupFeedbackSubscription();

  return wsServer;
}

/**
 * Handle incoming WebSocket messages
 * @param message The message received
 * @param clientId The client ID
 * @param ws The WebSocket connection
 */
function handleMessage(message: string, clientId: string, ws: WebSocket) {
  try {
    const data = JSON.parse(message);
    logger.debug(`Received message from client ${clientId}:`, data);

    // Handle different message types
    switch (data.type) {
      case 'subscribe':
        handleSubscribe(data, clientId, ws);
        break;
      case 'unsubscribe':
        handleUnsubscribe(data, clientId);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  } catch (error) {
    logger.error(`Error handling WebSocket message from client ${clientId}:`, error);
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
  }
}

/**
 * Handle client subscription requests
 */
function handleSubscribe(data: any, clientId: string, ws: WebSocket) {
  // Store subscription information in client metadata
  ws.on('close', () => {
    // Clean up logic
  });

  ws.send(JSON.stringify({ 
    type: 'subscribed', 
    topic: data.topic || 'all',
    message: 'Subscription successful'
  }));
}

/**
 * Handle client unsubscription requests
 */
function handleUnsubscribe(data: any, clientId: string) {
  const client = clients.get(clientId);
  if (client) {
    client.send(JSON.stringify({ 
      type: 'unsubscribed', 
      topic: data.topic || 'all',
      message: 'Unsubscription successful'
    }));
  }
}

/**
 * Handle client disconnections
 */
function handleDisconnection(clientId: string) {
  clients.delete(clientId);
  logger.info(`WebSocket client disconnected: ${clientId}`);
}

/**
 * Generate a unique client ID
 */
function generateClientId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set up Supabase subscription for feedback changes
 */
function setupFeedbackSubscription() {
  feedbackService.subscribeToFeedbackChanges('*', (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Broadcast the change to all connected clients
    broadcastToClients({
      type: 'db_change',
      table: 'customer_feedback',
      event: eventType,
      record: newRecord || oldRecord,
      timestamp: new Date().toISOString()
    });
  }, 'websocket-server');
}

/**
 * Broadcast a message to all connected clients
 */
export function broadcastToClients(message: any) {
  const messageString = JSON.stringify(message);
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}

/**
 * Shutdown the WebSocket server
 */
export function shutdownWebSocketServer() {
  if (wsServer) {
    wsServer.close();
    wsServer = null;
    clients.clear();
    
    // Unsubscribe from Supabase
    feedbackService.unsubscribeFromFeedbackChanges('websocket-server');
    
    logger.info('WebSocket server has been shut down');
  }
}

export default {
  initializeWebSocketServer,
  broadcastToClients,
  shutdownWebSocketServer
};