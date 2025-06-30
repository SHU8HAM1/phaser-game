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
        // Assumes grassland_tiles.png (now your 256x256px file) is in public/assets/tilesets/
        const tilesetURL = '/assets/tilesets/grassland_tiles.png'; // Using the same name as before for simplicity
        console.log(`Initiating preload for your 8x8 tileset (32x32 tiles) from: ${tilesetURL}`);
        this.load.spritesheet('tileset_custom', tilesetURL, { // New key: 'tileset_custom'
            frameWidth: 32, // Your tile width
            frameHeight: 32  // Your tile height
        });
    }

    create() {
        console.log('BootScene create, starting MainScene');
        this.scene.start('MainScene');
    }
}

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

        // Your target tile index: 6th from left (col 5), 5th from top (row 4) in an 8-col grid
        // index = (row * num_cols) + col = (4 * 8) + 5 = 37
        const targetTileIndex = 37;

        // Create map data (30x30 grid), all using your target tile
        const mapData: number[][] = [];
        for (let y = 0; y < mapHeight; y++) {
            const row: number[] = [];
            for (let x = 0; x < mapWidth; x++) {
                row.push(targetTileIndex);
            }
            mapData.push(row);
        }

        // Create the orthogonal tilemap
        const map = this.make.tilemap({
            data: mapData,
            tileWidth: tilePixelWidth,
            tileHeight: tilePixelHeight,
            width: mapWidth,
            height: mapHeight,
            orientation: Phaser.Tilemaps.Orientation.ORTHOGONAL, // Set to Orthogonal
        });

        // Add your tileset image to the map
        // First param: Name for the tileset within Tiled (arbitrary here)
        // Second param: Key of the preloaded tileset image in Phaser ('tileset_custom')
        // Third/Fourth: Tile width/height in the spritesheet (32x32 for yours)
        const tileset = map.addTilesetImage('my_custom_tiles', 'tileset_custom', tilePixelWidth, tilePixelHeight);

        if (tileset) {
            const layer = map.createLayer(0, tileset, 0, 0); // Layer index 0
            if (layer) {
                console.log('Orthogonal tilemap layer created successfully with your custom tile.');
            } else {
                console.error('Failed to create orthogonal tilemap layer.');
            }
        } else {
            console.error('Failed to add custom tileset to map. Is the key "tileset_custom" correct and loaded?');
        }

        this.add.text(10, 10, 'Orthogonal Map with Your Tile! Use cursors to scroll.', {
            color: '#ffffff',
            fontSize: '16px',
            backgroundColor: 'rgba(0,0,0,0.7)'
        }).setScrollFactor(0);

        // Camera setup for orthogonal map
        // World dimensions are simpler: mapWidthInTiles * tilePixelWidth
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cursors = this.input.keyboard?.createCursorKeys();
    }

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    update(time: number, delta: number) {
        if (!this.cursors) return;
        const speed = 400;
        const scrollSpeed = speed * (delta / 1000);

        if (this.cursors.left.isDown) this.cameras.main.scrollX -= scrollSpeed;
        else if (this.cursors.right.isDown) this.cameras.main.scrollX += scrollSpeed;
        if (this.cursors.up.isDown) this.cameras.main.scrollY -= scrollSpeed;
        else if (this.cursors.down.isDown) this.cameras.main.scrollY += scrollSpeed;
    }
}

const PhaserGame: React.FC<PhaserGameProps> = () => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && gameContainerRef.current && !gameInstanceRef.current) {
            // Orthogonal map dimensions
            const mapTilesWide = 30;
            const mapTilesHigh = 30;
            const tilePixelWidth = 32;
            const tilePixelHeight = 32;

            const gameWorldWidth = mapTilesWide * tilePixelWidth; // 30 * 32 = 960
            const gameWorldHeight = mapTilesHigh * tilePixelHeight; // 30 * 32 = 960

            // Viewport size
            const viewportWidth = Math.min(gameWorldWidth, 960);
            const viewportHeight = Math.min(gameWorldHeight, 960);

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: viewportWidth,
                height: viewportHeight,
                parent: gameContainerRef.current,
                scene: [BootScene, MainScene],
                physics: { // Physics might not be used yet but good to have configured
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0 },
                        debug: false
                    }
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
    const viewportWidth = Math.min(gameWorldWidth, 960);
    const viewportHeight = Math.min(gameWorldHeight, 960);


    return <div ref={gameContainerRef} id="phaser-game-container" style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px`, overflow: 'hidden' }} />;
};

export default PhaserGame;
