import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

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
        // Load a simple image or resource if desired, e.g.
        // this.load.image('logo', 'http://labs.phaser.io/assets/sprites/phaser3-logo.png');
    }

    create() {
        console.log('MainScene create');
        this.add.text(100, 100, 'Hello from Phaser!', { color: '#ffffff', fontSize: '24px' });
        // Example of adding an image if loaded:
        // this.add.image(400, 300, 'logo');
    }

    update() {
        // Main game loop
    }
}

const PhaserGame: React.FC<PhaserGameProps> = () => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && gameContainerRef.current && !gameInstanceRef.current) {
            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                parent: gameContainerRef.current, // Attach Phaser canvas to the div
                scene: [BootScene, MainScene], // Add scenes to the game
                physics: { // Optional: basic physics engine
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0 },
                        debug: false
                    }
                },
                pixelArt: true,
            };

            gameInstanceRef.current = new Phaser.Game(config);
            console.log('Phaser Game instance created');
        }

        return () => {
            if (gameInstanceRef.current) {
                console.log('Destroying Phaser Game instance');
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    return <div ref={gameContainerRef} id="phaser-game-container" style={{ width: '800px', height: '600px' }} />;
};

export default PhaserGame;
