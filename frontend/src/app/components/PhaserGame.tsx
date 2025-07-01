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
    constructor() {
        super('MainScene');
    }

    preload() {
        console.log('MainScene preload');
    }

    create() {
        console.log('MainScene create');

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


        this.cursors = this.input.keyboard?.createCursorKeys();

        // After generating obstacleData and creating the player
        // Store map and player position as matrices for backend use
        this.mapMatrix = obstacleData.map(row => [...row]);
        this.playerPosition = { x: player.x, y: player.y };
    }

    private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private mapMatrix?: number[][];
    private playerPosition?: { x: number, y: number };

    update(time: number, delta: number) {
        if (!this.cursors || !this.player) return;
        const speed = 200;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown) {
            vx = -speed;
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            vx = speed;
            this.player.anims.play('right', true);
        } else if (this.cursors.up.isDown) {
            vy = -speed;
            this.player.anims.play('up', true);
        } else if (this.cursors.down.isDown) {
            vy = speed;
            this.player.anims.play('down', true);
        } else {
            this.player.anims.stop();
        }
        this.player.setVelocity(vx, vy);
        // Update player position for backend use
        this.playerPosition = { x: this.player.x, y: this.player.y };
    }
}

const PhaserGame: React.FC<PhaserGameProps> = () => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
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
