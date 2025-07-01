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
        // console.log(`[${clientId}] KeyPress: ${message.payload.key}, ActiveKeys: ${Array.from(player.activeKeys)}`);
      } else if (message.type === 'keyRelease') {
        player.activeKeys.delete(message.payload.key);
        // console.log(`[${clientId}] KeyRelease: ${message.payload.key}, ActiveKeys: ${Array.from(player.activeKeys)}`);
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
    let currentX = player.x;
    let currentY = player.y;
    let nextX = currentX + player.vx * deltaTime;
    let nextY = currentY + player.vy * deltaTime;

    let finalX = currentX;
    let finalY = currentY;
    let canMoveX = true;
    let canMoveY = true;

    // --- Collision Detection ---
    // Player dimensions (approximate collision box)
    const playerWidth = 28;
    const playerHeight = 28;

    // Check X-axis movement
    if (player.vx !== 0) {
        const xLeadingEdge = player.vx > 0 ? nextX + playerWidth : nextX;
        const xTile = Math.floor(xLeadingEdge / TILE_SIZE);

        // Check tiles at player's current top and bottom Y for the new X position
        const yTileTop = Math.floor(currentY / TILE_SIZE);
        const yTileBottom = Math.floor((currentY + playerHeight -1) / TILE_SIZE); // -1 to stay within player

        const collisionTileXTop = OBSTACLE_MATRIX[yTileTop] && OBSTACLE_MATRIX[yTileTop][xTile];
        const collisionTileXBottom = OBSTACLE_MATRIX[yTileBottom] && OBSTACLE_MATRIX[yTileBottom][xTile];

        if ((collisionTileXTop !== -1 && collisionTileXTop !== undefined) ||
            (collisionTileXBottom !== -1 && collisionTileXBottom !== undefined)) {
            canMoveX = false;
        }
    }
    if (canMoveX) {
        finalX = nextX;
    }

    // Check Y-axis movement (using potentially updated X if sliding is desired, or currentX if not)
    // For simplicity, let's use finalX from X-movement resolution.
    if (player.vy !== 0) {
        const yLeadingEdge = player.vy > 0 ? nextY + playerHeight : nextY;
        const yTile = Math.floor(yLeadingEdge / TILE_SIZE);

        // Check tiles at player's resolved X (finalX) left and right for the new Y position
        const xTileLeft = Math.floor(finalX / TILE_SIZE);
        const xTileRight = Math.floor((finalX + playerWidth -1) / TILE_SIZE);

        const collisionTileYLeft = OBSTACLE_MATRIX[yTile] && OBSTACLE_MATRIX[yTile][xTileLeft];
        const collisionTileYRight = OBSTACLE_MATRIX[yTile] && OBSTACLE_MATRIX[yTile][xTileRight];

        if ((collisionTileYLeft !== -1 && collisionTileYLeft !== undefined) ||
            (collisionTileYRight !== -1 && collisionTileYRight !== undefined)) {
            canMoveY = false;
        }
    }
    if (canMoveY) {
        finalY = nextY;
    }

    player.x = finalX;
    player.y = finalY;

    // Ensure player stays within overall map pixel bounds (redundant if border tiles are solid)
    player.x = Math.max(0, Math.min(player.x, MAP_WIDTH_TILES * TILE_SIZE - 28)); // 28 is player width
    player.y = Math.max(0, Math.min(player.y, MAP_HEIGHT_TILES * TILE_SIZE - 28)); // 28 is player height

    // if (player.vx !== 0 || player.vy !== 0 || player.activeKeys.size > 0) { // Debug Log
    //   console.log(
    //     `[GameLoop] Client: ${clientId}, ` +
    //     `ActiveKeys: ${Array.from(player.activeKeys)}, ` +
    //     `VX: ${player.vx.toFixed(2)}, VY: ${player.vy.toFixed(2)}, ` +
    //     `NextX: ${nextX.toFixed(2)}, NextY: ${nextY.toFixed(2)}, ` + // nextX, nextY are now local to the loop iteration
    //     `FinalX: ${player.x.toFixed(2)}, FinalY: ${player.y.toFixed(2)}, ` +
    //     `canMoveX: ${canMoveX}, canMoveY: ${canMoveY}` // canMoveX, canMoveY are now local
    //   );
    // }
  });

  broadcastGameState();
}

setInterval(gameLoop, SERVER_TICK_RATE);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  console.log(`Game loop running at ${1000 / SERVER_TICK_RATE} FPS.`);
});
