import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

interface PhaserGameProps {
    // Props can be added here if needed later, e.g., to pass game configurations
}

// Simple Boot Scene to load assets if any, then start the MainScene
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log('BootScene preload');
        // Load your new 8x8 tileset (32x32 tiles)
        // Assumes tileset.png (now your 256x256px file) is in public/assets/tilesets/
        const tilesetURL = '/assets/tilesets/tileset.png'; // Using the same name as before for simplicity
        console.log(`Initiating preload for your 8x8 tileset (32x32 tiles) from: ${tilesetURL}`);
        this.load.spritesheet('tileset_custom', tilesetURL, { // New key: 'tileset_custom'
            frameWidth: 32, // Your tile width
            frameHeight: 32  // Your tile height
        });
        this.load.spritesheet('player', '/assets/sprites/george.png', {
            frameWidth: 48,
            frameHeight: 48
        });
    }

    create() {
        console.log('BootScene create, starting MainScene');
        this.scene.start('MainScene');
    }
}

// OBSTACLE_MATRIX: Playable, organic, small clusters, no cluster >4x4, more open space, no obstacles adjacent to border
const OBSTACLE_MATRIX: number[][] = [
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

,
];

// Main Scene for basic game elements
class MainScene extends Phaser.Scene {
    private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody; // Local player sprite
    private otherPlayers: Map<string, Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>; // Sprites for other players
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private mapMatrix?: number[][];
    private ws?: WebSocket;
    private pressedKeys: Set<string>;
    private localClientId?: string;
    private lastServerUpdate: any = null; // Store the last received game state

    constructor() {
        super('MainScene');
        this.pressedKeys = new Set();
        this.otherPlayers = new Map();
    }

    init() {
        // Attempt to get WebSocket from registry
        this.ws = this.game.registry.get('ws');
        this.localClientId = this.game.registry.get('clientId');

        // Listen for changes in registry if they are set later
        this.game.registry.events.on('changedata-ws', (_parent: any, value: WebSocket) => {
            this.ws = value;
        });
        this.game.registry.events.on('changedata-clientId', (_parent: any, value: string) => {
            this.localClientId = value;
        });
         this.game.registry.events.on('changedata-serverGameState', (_parent: any, value: any) => {
            this.lastServerUpdate = value;
            // Process immediately if needed, or pick up in update()
            // this.handleGameStateUpdate(value);
        });
    }

    preload() {
        console.log('MainScene preload');
    }

    create() {
        console.log('MainScene create');

        // Retrieve WebSocket connection from registry
        this.ws = this.game.registry.get('ws');
        if (this.ws) {
            console.log('MainScene: WebSocket connection retrieved from registry.');
        } else {
            console.warn('MainScene: WebSocket connection not found in registry at create time. Will check in update.');
            // Optionally, listen for an event from the registry if ws is set later
            this.game.registry.events.on('changedata-ws', (_parent: any, value: WebSocket) => {
                console.log('MainScene: WebSocket connection set in registry after create.');
                this.ws = value;
            });
        }


        // Tilemap configuration for your orthogonal tileset
        const mapWidth = 30; // Number of tiles wide
        const mapHeight = 30; // Number of tiles high
        const tilePixelWidth = 32; // Width of a single tile in pixels
        const tilePixelHeight = 32; // Height of a single tile in pixels

        const targetTileIndex = 1;
        const borderTileIndex = 248; // New border tile index
        const obstacleTileIndex = 41; // Obstacle tile index

        // Generate base layer (ground)
        const groundData: number[][] = [];
        for (let y = 0; y < mapHeight; y++) {
            const row: number[] = [];
            for (let x = 0; x < mapWidth; x++) {
                row.push(targetTileIndex);
            }
            groundData.push(row);
        }

        // Use OBSTACLE_MATRIX for obstacles
        const obstacleData: number[][] = OBSTACLE_MATRIX.map(row => [...row]);

        // Create the orthogonal tilemap
        const map = this.make.tilemap({
            tileWidth: tilePixelWidth,
            tileHeight: tilePixelHeight,
            width: mapWidth,
            height: mapHeight
        });

        // Add your tileset image to the map
        const tileset = map.addTilesetImage('my_custom_tiles', 'tileset_custom', tilePixelWidth, tilePixelHeight, 0, 0);
        if (!tileset) {
            throw new Error('Tileset failed to load.');
        }

        // Enable pixel rounding to avoid subpixel rendering seams
        this.cameras.main.roundPixels = true;

        // Create ground layer (base)
        const groundLayer = map.createBlankLayer('ground', tileset, 0, 0);
        groundLayer?.putTilesAt(groundData, 0, 0);
        groundLayer?.setDepth(0);

        // Create obstacle+border layer
        const obstacleLayer = map.createBlankLayer('obstacles', tileset, 0, 0);
        obstacleLayer?.putTilesAt(obstacleData, 0, 0);
        // Recalculate collision after putTilesAt
        obstacleLayer?.setCollision([borderTileIndex, obstacleTileIndex], true, true);
        obstacleLayer?.setDepth(1);
        obstacleLayer?.setAlpha(1); // Ensure obstacle layer is fully opaque

        // Camera setup for orthogonal map
        // World dimensions are simpler: mapWidthInTiles * tilePixelWidth
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(1.4);

        if (!obstacleLayer) {
            throw new Error('Tileset failed to load.');
        }

        const player = this.physics.add.sprite(100, 100, 'player').setScale(1);
        // Set player body size to fit within a tile for smooth movement
        player.body.setSize(28, 28).setOffset(10, 10);
        this.cameras.main.startFollow(player);
        this.player = player;
        this.physics.add.collider(player, obstacleLayer);

        // Animations for each direction, 4 frames each
        this.anims.create({
            key: 'down',
            frames: [{key: 'player', frame: 0}, {key: 'player', frame: 4}, {key: 'player', frame: 8}, {key: 'player', frame: 12}],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: [{key: 'player', frame: 1}, {key: 'player', frame: 5}, {key: 'player', frame: 9}, {key: 'player', frame: 13}],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: [{key: 'player', frame: 2}, {key: 'player', frame: 6}, {key: 'player', frame: 10}, {key: 'player', frame: 14}],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: [{key: 'player', frame: 3}, {key: 'player', frame: 7}, {key: 'player', frame: 11}, {key: 'player', frame: 15}],
            frameRate: 8,
            repeat: -1
        });


        this.cursors = this.input.keyboard?.createCursorKeys(); // Keep for easy access to key states if needed, but direct event handling is better for press/release.

        // After generating obstacleData and creating the player
        // Store map and player position as matrices for backend use
        this.mapMatrix = obstacleData.map(row => [...row]);
        // this.playerPosition = { x: player.x, y: player.y }; // Player position will be updated by server

        // Setup keyboard event handling for sending messages
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            this.handleKeyEvent(event.key, 'keyPress');
        });

        this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
            this.handleKeyEvent(event.key, 'keyRelease');
        });
    }

    private sendKeyWebSocketMessage(key: string, type: 'keyPress' | 'keyRelease') {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = {
                type: type,
                payload: {
                    key: key,
                    timestamp: Date.now()
                }
            };
            this.ws.send(JSON.stringify(message));
            // console.log(`Sent ${type}: ${key}`);
        } else {
            // Attempt to re-fetch ws from registry if it wasn't available initially
            if (!this.ws) this.ws = this.game.registry.get('ws');
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                 console.warn('WebSocket not connected. Key event not sent.');
            } else {
                // If ws was just re-fetched and is open, try sending again
                this.ws.send(JSON.stringify({type: type, payload: { key: key, timestamp: Date.now() }}));
            }
        }
    }

    private handleKeyEvent(key: string, eventType: 'keyPress' | 'keyRelease') {
        let gameKey: string | null = null;
        switch (key) {
            case 'ArrowUp': gameKey = 'Up'; break;
            case 'ArrowDown': gameKey = 'Down'; break;
            case 'ArrowLeft': gameKey = 'Left'; break;
            case 'ArrowRight': gameKey = 'Right'; break;
        }

        if (gameKey) {
            if (eventType === 'keyPress' && !this.pressedKeys.has(gameKey)) {
                this.pressedKeys.add(gameKey);
                this.sendKeyWebSocketMessage(gameKey, 'keyPress');
                // Play animation locally for responsiveness
                if (this.player) {
                    if (gameKey === 'Left') this.player.anims.play('left', true);
                    else if (gameKey === 'Right') this.player.anims.play('right', true);
                    else if (gameKey === 'Up') this.player.anims.play('up', true);
                    else if (gameKey === 'Down') this.player.anims.play('down', true);
                }
            } else if (eventType === 'keyRelease' && this.pressedKeys.has(gameKey)) {
                this.pressedKeys.delete(gameKey);
                this.sendKeyWebSocketMessage(gameKey, 'keyRelease');
                // Stop animation or set to idle if no other movement keys are pressed
                if (this.player && this.pressedKeys.size === 0) {
                    this.player.anims.stop();
                    // Optionally set to an idle frame: this.player.setFrame(someIdleFrame);
                } else if (this.player) {
                    // If other keys are still pressed, play their animation
                    // This logic might need refinement based on desired behavior for multiple key presses
                    if (this.pressedKeys.has('Left')) this.player.anims.play('left', true);
                    else if (this.pressedKeys.has('Right')) this.player.anims.play('right', true);
                    else if (this.pressedKeys.has('Up')) this.player.anims.play('up', true);
                    else if (this.pressedKeys.has('Down')) this.player.anims.play('down', true);
                }
            }
        }
    }


    update(time: number, delta: number) {
        // Ensure ws and clientId are available if they weren't at init/create
        if (!this.ws) this.ws = this.game.registry.get('ws');
        if (!this.localClientId) this.localClientId = this.game.registry.get('clientId');

        const serverGameState = this.game.registry.get('serverGameState');
        if (serverGameState && serverGameState !== this.lastServerUpdate) {
            this.lastServerUpdate = serverGameState; // Mark as processed for this frame, or use a more robust flag
            this.handleGameStateUpdate(serverGameState);
        }
        // Clear the registry value after processing to avoid reprocessing if no new update comes
        // Or rely on this.lastServerUpdate comparison. For now, let's clear it.
        this.game.registry.set('serverGameState', null);


        // Local animation updates for the local player (based on pressed keys)
        // This provides immediate feedback, while actual position is server-driven.
        // This part can be refined: animations might better be driven by server velocity.
        if (this.player && this.pressedKeys.size > 0) {
            if (this.pressedKeys.has('Left')) this.player.anims.play('left', true);
            else if (this.pressedKeys.has('Right')) this.player.anims.play('right', true);
            else if (this.pressedKeys.has('Up')) this.player.anims.play('up', true);
            else if (this.pressedKeys.has('Down')) this.player.anims.play('down', true);
        } else if (this.player && this.pressedKeys.size === 0) {
            // If server also sends velocity, use that to determine if player is idle.
            // For now, if no keys are pressed, stop animation.
            // This might conflict if server says player is moving due to latency.
            // A better approach is to have server state include current animation or velocity.
            // Let's assume server player state includes vx, vy.
            const localPlayerData = this.lastServerUpdate?.players[this.localClientId!];
            if (localPlayerData && localPlayerData.vx === 0 && localPlayerData.vy === 0) {
                 this.player.anims.stop();
            }
        }
    }

    private handleGameStateUpdate(gameState: any) {
        if (!gameState || !gameState.players) return;

        const serverPlayers = gameState.players;
        const allServerPlayerIds = Object.keys(serverPlayers);

        // Update local player
        if (this.player && this.localClientId && serverPlayers[this.localClientId]) {
            const playerData = serverPlayers[this.localClientId];
            this.tweens.add({
                targets: this.player,
                x: playerData.x,
                y: playerData.y,
                duration: 100, // Corresponds roughly to server tick rate, adjust for smoothness
                ease: 'Linear'
            });

            // Update animation based on server velocity for local player
            if (playerData.vx < 0) this.player.anims.play('left', true);
            else if (playerData.vx > 0) this.player.anims.play('right', true);
            else if (playerData.vy < 0) this.player.anims.play('up', true);
            else if (playerData.vy > 0) this.player.anims.play('down', true);
            else this.player.anims.stop(); // Idle if no velocity
        }

        // Update or create other players
        allServerPlayerIds.forEach(clientId => {
            if (clientId === this.localClientId) return; // Already handled

            const playerData = serverPlayers[clientId];
            let otherPlayerSprite = this.otherPlayers.get(clientId);

            if (!otherPlayerSprite) { // Create new sprite for new player
                console.log(`Creating sprite for new player ${clientId}`);
                otherPlayerSprite = this.physics.add.sprite(playerData.x, playerData.y, 'player').setScale(1);
                otherPlayerSprite.body.setSize(28,28).setOffset(10,10); // Match local player collision
                // otherPlayerSprite.setCollideWorldBounds(true); // If they need physics interaction
                this.otherPlayers.set(clientId, otherPlayerSprite);
            }

            // Tween existing other player sprite
            this.tweens.add({
                targets: otherPlayerSprite,
                x: playerData.x,
                y: playerData.y,
                duration: 100, // Adjust for smoothness
                ease: 'Linear'
            });

            // Update animation for other players based on server velocity
            if (playerData.vx < 0) otherPlayerSprite.anims.play('left', true);
            else if (playerData.vx > 0) otherPlayerSprite.anims.play('right', true);
            else if (playerData.vy < 0) otherPlayerSprite.anims.play('up', true);
            else if (playerData.vy > 0) otherPlayerSprite.anims.play('down', true);
            else otherPlayerSprite.anims.stop();
        });

        // Remove sprites for players who disconnected
        this.otherPlayers.forEach((sprite, clientId) => {
            if (!allServerPlayerIds.includes(clientId)) {
                console.log(`Removing sprite for disconnected player ${clientId}`);
                sprite.destroy();
                this.otherPlayers.delete(clientId);
            }
        });
    }
}

const PhaserGame: React.FC<PhaserGameProps> = () => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);
    const wsRef = useRef<WebSocket | null>(null); // Ref to hold the WebSocket instance

    useEffect(() => {
        // Initialize WebSocket connection
        // Ensure this runs only once or is properly cleaned up
        if (typeof window !== 'undefined' && !wsRef.current) {
            const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
            console.log(`Connecting to WebSocket server at ${websocketUrl}`);
            const socket = new WebSocket(websocketUrl);

            socket.onopen = () => {
                console.log('WebSocket connection established');
                wsRef.current = socket;
                // Store WebSocket instance in Phaser Registry for scenes to access
                if (gameInstanceRef.current) {
                    gameInstanceRef.current.registry.set('ws', socket);
                    console.log('WebSocket instance stored in Phaser Registry.');
                }
                // Optionally send a message upon connection
                // socket.send(JSON.stringify({ type: 'clientHello', message: 'Hello from Phaser frontend!' }));
            };

            socket.onmessage = (event) => {
                console.log('WebSocket message received:', event.data);
                try {
                    const message = JSON.parse(event.data as string);
                    // Handle messages from the server
                    if (message.type === 'gameStateUpdate') {
                        // console.log('Game state update:', message.payload); // Can be too verbose
                        // Pass the gameState to the active scene (MainScene) via registry
                        if (gameInstanceRef.current) {
                            // It's good practice to pass only necessary data or diffs,
                            // but for now, we pass the whole player's part of the payload.
                            // The scene will decide how to use it.
                            gameInstanceRef.current.registry.set('serverGameState', message.payload);
                            // We can also emit an event if the scene needs to react immediately
                            // gameInstanceRef.current.events.emit('serverGameStateUpdate', message.payload);
                        }
                    } else if (message.type === 'welcome') {
                        console.log(`Welcome message from server: ${message.message} (Client ID: ${message.clientId})`);
                        if (gameInstanceRef.current) {
                            gameInstanceRef.current.registry.set('clientId', message.clientId);
                        }
                    } else if (message.type === 'chat') {
                        console.log(`Chat from ${message.senderId}: ${message.payload}`);
                    } else if (message.type === 'error') {
                        console.error(`Error from server: ${message.message}`);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message or handling event:', error);
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            socket.onclose = (event) => {
                console.log('WebSocket connection closed:', event.reason, `Code: ${event.code}`);
                wsRef.current = null;
            };
        }

        // Initialize Phaser Game
        if (typeof window !== 'undefined' && gameContainerRef.current && !gameInstanceRef.current) {
            // Orthogonal map dimensions
            const mapTilesWide = 40;
            const mapTilesHigh = 40;
            const tilePixelWidth = 32;
            const tilePixelHeight = 32;

            const gameWorldWidth = mapTilesWide * tilePixelWidth; // 30 * 32 = 960
            const gameWorldHeight = mapTilesHigh * tilePixelHeight; // 30 * 32 = 960

            // Viewport size
            const viewportWidth = Math.min(gameWorldWidth, 720);
            const viewportHeight = Math.min(gameWorldHeight, 600);

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: viewportWidth,
                height: viewportHeight,
                parent: gameContainerRef.current,
                scene: [BootScene, MainScene],
                physics: { // Physics might not be used yet but good to have configured
                    default: 'arcade',
                },
                pixelArt: true,
                render: {
                    antialias: false,
                    pixelArt: true,
                }
            };

            gameInstanceRef.current = new Phaser.Game(config);
            console.log('Phaser Game instance created with orthogonal config:', config);
        }

        return () => {
            if (gameInstanceRef.current) {
                console.log('Destroying Phaser Game instance');
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []);

    // Adjust div style to match viewport
    const mapTilesWide = 30;
    const mapTilesHigh = 30;
    const tilePixelWidth = 32;
    const tilePixelHeight = 32;
    const gameWorldWidth = mapTilesWide * tilePixelWidth;
    const gameWorldHeight = mapTilesHigh * tilePixelHeight;
    const viewportWidth = Math.min(gameWorldWidth, 720);
    const viewportHeight = Math.min(gameWorldHeight, 600);


    return <div ref={gameContainerRef} id="phaser-game-container" style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px`, overflow: 'hidden' }} />;
};

export default PhaserGame;
