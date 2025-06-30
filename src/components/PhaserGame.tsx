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
        // For now, no assets to preload for the basic setup
        console.log('BootScene preload');
        // Load the grassland tileset image
        // URL: https://opengameart.org/sites/default/files/grassland_tiles.png
        // Key: 'tileset_grass'
        // Frame Width: 64, Frame Height: 128 (as determined from TMX analysis for this specific tilesheet)
        this.load.spritesheet('tileset_grass', 'https://opengameart.org/sites/default/files/grassland_tiles.png', {
            frameWidth: 64,
            frameHeight: 128
        });
        console.log('Grassland tileset preload initiated');
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

        // Tilemap configuration
        const mapWidth = 30;
        const mapHeight = 30;
        const tileWidthIsometric = 64; // Base width of the isometric cell
        const tileHeightIsometric = 32; // Base height of the isometric cell

        // Create map data (30x30 grid)
        // Using 0 for grass, 1 for a path (assuming from tileset_grass)
        const mapData: number[][] = [];
        for (let y = 0; y < mapHeight; y++) {
            const row: number[] = [];
            for (let x = 0; x < mapWidth; x++) {
                if (y === Math.floor(mapHeight / 2) && x >= 5 && x < mapWidth - 5) {
                    row.push(1); // Path tile index
                } else {
                    row.push(0); // Grass tile index
                }
            }
            mapData.push(row);
        }

        // Create the tilemap
        // For isometric maps, Phaser needs the tileWidth and tileHeight of the base cell,
        // not necessarily the frameWidth/frameHeight of the spritesheet if they differ.
        const map = this.make.tilemap({
            data: mapData,
            tileWidth: tileWidthIsometric, // Width of the isometric grid cell
            tileHeight: tileHeightIsometric, // Height of the isometric grid cell
            width: mapWidth,
            height: mapHeight,
            orientation: Phaser.Tilemaps.Orientation.ISOMETRIC, // Explicitly set orientation
        });

        // Add the tileset image to the map.
        // The first parameter is the name of the Tiled tileset (can be arbitrary if not using Tiled JSON).
        // The second is the key of the preloaded tileset image in Phaser.
        // The third and fourth are tileWidth and tileHeight *as defined in the spritesheet frames*.
        // For isometric tiles that "stand up", this will be different from the map's cell dimensions.
        const tileset = map.addTilesetImage('grassland_isometric_tiles', 'tileset_grass', 64, 128);

        if (tileset) {
            // Create the layer. Layer name can be arbitrary.
            const layer = map.createLayer(0, tileset, 0, 0);
            if (layer) {
                console.log('Tilemap layer created successfully');
                // Optional: If you want tiles to have different depths based on Y
                // layer.setDepthSort(true); // Might not be needed for pure background
            } else {
                console.error('Failed to create tilemap layer.');
            }
        } else {
            console.error('Failed to add tileset to map. Is the key "tileset_grass" correct and loaded?');
        }

        this.add.text(10, 10, 'Tilemap Loaded! Use cursors to scroll.', {
            color: '#ffffff',
            fontSize: '16px',
            backgroundColor: 'rgba(0,0,0,0.7)'
        }).setScrollFactor(0); // Keep text fixed on screen

        // Camera setup
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
        this.cursors = this.input.keyboard?.createCursorKeys();
    }

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    update(time: number, delta: number) {
        if (!this.cursors) return;

        const speed = 400; // pixels per second
        const scrollSpeed = speed * (delta / 1000);

        if (this.cursors.left.isDown) {
            this.cameras.main.scrollX -= scrollSpeed;
        } else if (this.cursors.right.isDown) {
            this.cameras.main.scrollX += scrollSpeed;
        }

        if (this.cursors.up.isDown) {
            this.cameras.main.scrollY -= scrollSpeed;
        } else if (this.cursors.down.isDown) {
            this.cameras.main.scrollY += scrollSpeed;
        }
    }
}

const PhaserGame: React.FC<PhaserGameProps> = () => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && gameContainerRef.current && !gameInstanceRef.current) {
            // Isometric map dimensions
            const mapTilesWide = 30;
            const mapTilesHigh = 30;
            const cellWidth = 64; // isometric cell width
            const cellHeight = 32; // isometric cell height

            // Calculate the overall pixel size of the isometric map
            // For an isometric map, width = (mapTilesWide + mapTilesHigh) * cellWidth / 2
            // And height = (mapTilesWide + mapTilesHigh) * cellHeight / 2
            const gameWorldWidth = (mapTilesWide + mapTilesHigh) * cellWidth / 2; // (30+30)*32 = 1920
            const gameWorldHeight = (mapTilesWide + mapTilesHigh) * cellHeight / 2; // (30+30)*16 = 960

            // Viewport size (how much of the game world is visible at once)
            const viewportWidth = Math.min(gameWorldWidth, 1280); // Cap viewport at 1280 or world width
            const viewportHeight = Math.min(gameWorldHeight, 720); // Cap viewport at 720 or world height

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: viewportWidth, // Display width
                height: viewportHeight, // Display height
                parent: gameContainerRef.current,
                scene: [BootScene, MainScene],
                physics: {
                    default: 'arcade', // Arcade physics not typically used for isometric tile movement directly
                    arcade: {
                        gravity: { y: 0 },
                        debug: false // Set to true for debugging physics bodies
                    }
                },
                pixelArt: true, // Good for many pixel art tilesets
                render: {
                    antialias: false, // Ensures pixel art isn't blurred
                    pixelArt: true, // Redundant with top-level pixelArt but good for emphasis
                }
            };

            gameInstanceRef.current = new Phaser.Game(config);
            console.log('Phaser Game instance created with config:', config);
        }

        return () => {
            if (gameInstanceRef.current) {
                console.log('Destroying Phaser Game instance');
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []);

    // Adjust div style to match viewport, or make it scrollable if fixed size
    // For now, let's make the container match the game viewport size
    const viewportWidth = Math.min((30 + 30) * 64 / 2, 1280);
    const viewportHeight = Math.min((30 + 30) * 32 / 2, 720);

    return <div ref={gameContainerRef} id="phaser-game-container" style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px`, overflow: 'hidden' }} />;
};

export default PhaserGame;
