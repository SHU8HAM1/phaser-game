const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = process.env.PORT || 3001;

// Basic game state
let gameState = {
  players: {}, // Store player data, e.g., { id: { x, y } }
  // Add other game-related state here, e.g., scores, game status
};

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Function to broadcast game state to all clients
const broadcastGameState = () => {
  const message = JSON.stringify({ type: 'gameStateUpdate', payload: gameState });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

wss.on('connection', (ws) => {
  const clientId = Date.now().toString(); // Simple unique ID for the player
  console.log(`Client ${clientId} connected`);
  gameState.players[clientId] = { x: 0, y: 0 }; // Initial position

  // Send initial welcome message and current game state
  ws.send(JSON.stringify({ type: 'welcome', clientId, message: 'Welcome to the WebSocket server!' }));
  broadcastGameState(); // Send current game state to the new client and update others

  ws.on('message', (messageString) => {
    console.log(`Client ${clientId} received: %s`, messageString);
    try {
      const message = JSON.parse(messageString);

      // Handle different message types from clients
      if (message.type === 'playerMove') {
        // Example: Update player position
        if (gameState.players[clientId]) {
          gameState.players[clientId].x = message.payload.x;
          gameState.players[clientId].y = message.payload.y;
          broadcastGameState(); // Broadcast updated state
        }
      } else if (message.type === 'chat') {
        // Example: Broadcast chat message to all clients
        const chatMessage = JSON.stringify({ type: 'chat', senderId: clientId, payload: message.payload });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(chatMessage);
          }
        });
      } else {
        // For any other message, just log it and optionally broadcast if needed
        console.log(`Unknown message type from ${clientId}: ${message.type}`);
        // Example: Echo or broadcast other messages if necessary
        // wss.clients.forEach((client) => {
        //   if (client !== ws && client.readyState === WebSocket.OPEN) {
        //     client.send(messageString); // Sending raw string back
        //   }
        // });
      }
    } catch (error) {
      console.error(`Failed to parse message from ${clientId} or handle event:`, error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    delete gameState.players[clientId]; // Remove player from state
    broadcastGameState(); // Update other clients about the disconnection
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
