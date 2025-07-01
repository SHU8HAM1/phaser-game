const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = process.env.PORT || 3001;

// --- Game Configuration ---
const PLAYER_SPEED = 200; // pixels per second
const SERVER_TICK_RATE = 1000 / 60; // 60 FPS
const TILE_SIZE = 32; // pixels

// OBSTACLE_MATRIX from frontend/src/app/components/PhaserGame.tsx
// Values: 248 for border, 41 for obstacle, -1 for walkable
const OBSTACLE_MATRIX = [
  [248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248],
  [248,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,248],
  [248,41,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,41,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,248],
  [248,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,41,-1,41,-1,-1,41,-1,41,-1,-1,248],
  [248,-1,-1,-1,-1,-1,-1,41,-1,41,41,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,248],
  [248,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,41,-1,41,-1,-1,-1,41,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,248],
  [248,-1,-1,41,-1,-1,-1,41,-1,-1,41,-1,-1,-1,-1,-1,41,-1,41,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,248],
  [248,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,41,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,248],
  [248,-1,-1,-1,41,-1,41,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,248],
  [248,-1,-1,-1,41,-1,-1,41,-1,-1,-1,-1,-1,-1,41,41,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,248],
  [248,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,41,41,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,248],
  [248,41,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,248],
  [248,-1,41,-1,-1,41,-1,-1,41,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,41,-1,-1,248],
  [248,-1,-1,41,-1,41,41,-1,-1,-1,41,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,41,248],
  [248,-1,-1,-1,-1,-1,41,-1,-1,41,-1,-1,41,-1,-1,41,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,248],
  [248,-1,41,-1,-1,41,-1,-1,41,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,41,-1,41,-1,41,-1,-1,-1,-1,-1,248],
  [248,-1,41,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,248],
  [248,-1,-1,41,-1,-1,-1,41,-1,41,-1,41,-1,-1,-1,-1,41,-1,41,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,248],
  [248,-1,-1,-1,41,-1,-1,41,-1,-1,-1,-1,-1,-1,41,-1,-1,41,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,248],
  [248,-1,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,41,-1,-1,-1,41,-1,-1,-1,41,41,-1,-1,-1,-1,41,-1,-1,248],
  [248,-1,41,-1,41,-1,-1,-1,41,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,248],
  [248,-1,-1,-1,-1,-1,-1,41,-1,-1,-1,-1,-1,-1,41,-1,-1,41,-1,41,-1,-1,-1,-1,-1,-1,41,-1,41,248],
  [248,-1,-1,-1,-1,-1,41,-1,-1,41,41,-1,-1,-1,41,-1,41,-1,-1,-1,41,-1,-1,-1,-1,41,-1,-1,-1,248],
  [248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248]
];
const MAP_WIDTH_TILES = OBSTACLE_MATRIX[0].length;
const MAP_HEIGHT_TILES = OBSTACLE_MATRIX.length;

// --- Game State ---
let gameState = {
  players: {}, // Stores player data: { clientId: { x, y, vx, vy, activeKeys: Set() } }
  // Add other game-related state here
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
  gameState.players[clientId] = {
    x: 100, // Initial position (example, should ideally be a valid starting point)
    y: 100,
    vx: 0,
    vy: 0,
    activeKeys: new Set(), // Stores currently pressed keys like 'Up', 'Down', 'Left', 'Right'
    // Add other player-specific state like current animation if needed by clients
  };

  // Send initial welcome message and current game state
  ws.send(JSON.stringify({ type: 'welcome', clientId, message: 'Welcome to the authoritative game server!' }));
  broadcastGameState(); // Send current game state to the new client and update others

  ws.on('message', (messageString) => {
    // console.log(`Client ${clientId} received: %s`, messageString); // Can be too verbose
    try {
      const message = JSON.parse(messageString);
      const player = gameState.players[clientId];
      if (!player) return; // Player might have disconnected

      if (message.type === 'keyPress') {
        player.activeKeys.add(message.payload.key);
      } else if (message.type === 'keyRelease') {
        player.activeKeys.delete(message.payload.key);
      } else if (message.type === 'chat') {
        // Example: Broadcast chat message to all clients
        const chatMessage = JSON.stringify({ type: 'chat', senderId: clientId, payload: message.payload });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(chatMessage);
          }
        });
      } else {
        console.log(`Unknown message type from ${clientId}: ${message.type}`);
      }
    } catch (error) {
      console.error(`Failed to parse message from ${clientId} ("${messageString}") or handle event:`, error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format or server error.' }));
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    delete gameState.players[clientId]; // Remove player from state
    broadcastGameState(); // Update other clients about the disconnection
  });
});

// --- Game Loop ---
function gameLoop() {
  const deltaTime = SERVER_TICK_RATE / 1000; // Delta time in seconds

  Object.keys(gameState.players).forEach(clientId => {
    const player = gameState.players[clientId];
    if (!player) return;

    // Reset velocity
    player.vx = 0;
    player.vy = 0;

    // Determine velocity based on active keys
    if (player.activeKeys.has('Left')) player.vx = -PLAYER_SPEED;
    if (player.activeKeys.has('Right')) player.vx = PLAYER_SPEED;
    if (player.activeKeys.has('Up')) player.vy = -PLAYER_SPEED;
    if (player.activeKeys.has('Down')) player.vy = PLAYER_SPEED;

    // Normalize diagonal movement (optional, but good practice)
    if (player.vx !== 0 && player.vy !== 0) {
        const factor = Math.sqrt(2);
        player.vx /= factor;
        player.vy /= factor;
    }

    // Calculate potential new position
    let nextX = player.x + player.vx * deltaTime;
    let nextY = player.y + player.vy * deltaTime;

    // --- Collision Detection ---
    // Basic AABB collision with tilemap. Player's anchor is top-left for sprite.
    // For simplicity, check a single point (e.g. center or future position of corners).
    // A more robust check would involve player's bounding box.
    // Player's body in Phaser is setSize(28, 28).setOffset(10, 10) from a 48x48 sprite.
    // Let's assume player's effective collision box center for now.
    // Player dimensions: width 28, height 28. Sprite anchor is 0.5,0.5 by default if not set for physics body.
    // But physics body has offset. Let's use player x,y as top-left of bounding box for simplicity.
    // Player bounding box: (nextX, nextY) to (nextX + 28, nextY + 28)

    // For simplicity, let's check the target tile for the player's center.
    // Player center: nextX + 14, nextY + 14
    const targetTileX = Math.floor((nextX + 14) / TILE_SIZE);
    const targetTileY = Math.floor((nextY + 14) / TILE_SIZE);

    let canMoveX = true;
    let canMoveY = true;

    // Check X-axis movement
    const checkTileX = Math.floor((nextX + (player.vx > 0 ? 28 : 0) ) / TILE_SIZE); // Check leading edge for X
    const tileAtNextX = OBSTACLE_MATRIX[targetTileY] && OBSTACLE_MATRIX[targetTileY][checkTileX];
    if (tileAtNextX !== -1 && tileAtNextX !== undefined) { // Collision on X
        canMoveX = false;
    }

    // Check Y-axis movement
    const checkTileY = Math.floor((nextY + (player.vy > 0 ? 28 : 0) ) / TILE_SIZE); // Check leading edge for Y
    const tileAtNextY = OBSTACLE_MATRIX[checkTileY] && OBSTACLE_MATRIX[checkTileY][targetTileX];
     if (tileAtNextY !== -1 && tileAtNextY !== undefined) { // Collision on Y
        canMoveY = false;
    }

    // More refined collision: check all four corners of the player's bounding box
    // Player bounding box: (x, y) to (x + playerWidth, y + playerHeight)
    // For now, using a simplified check. A full AABB vs Tilemap check is more involved.

    if (canMoveX) {
        player.x = nextX;
    }
    if (canMoveY) {
        player.y = nextY;
    }

    // Ensure player stays within map bounds (pixel coordinates)
    // This is a secondary check to the border tiles in OBSTACLE_MATRIX
    player.x = Math.max(0, Math.min(player.x, MAP_WIDTH_TILES * TILE_SIZE - 28)); // 28 is player width
    player.y = Math.max(0, Math.min(player.y, MAP_HEIGHT_TILES * TILE_SIZE - 28)); // 28 is player height

  });

  broadcastGameState();
}

setInterval(gameLoop, SERVER_TICK_RATE);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  console.log(`Game loop running at ${1000 / SERVER_TICK_RATE} FPS.`);
});
