'use client';

import { useEffect, useRef } from "react";

export default function Gameplay() {
  const gameRef = useRef(null);

  useEffect(() => {

    let Phaser;
    import("phaser").then((module) => {
    Phaser = module;


    if (gameRef.current) return; // Prevent multiple inits

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#87CEEB',
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            }
        },
        scene: {
            preload,
            create,
            update
        }
    };
    let player;
    let cursors;
    let obstacles;
    gameRef.current = new Phaser.Game(config);

    function preload() {
        this.load.image('tiles', 'https://labs.phaser.io/assets/tilemaps/tiles/grass-tiles.png');

        this.load.spritesheet('player', '/george.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.image('crate', 'https://labs.phaser.io/assets/sprites/crate.png');
    }

    function create() {
        const worldWidth = 2000;
        const worldHeight = 2000;

        const tileSize = 48;

        for (let x = 0; x < worldWidth; x += tileSize) {
        for (let y = 0; y < worldHeight; y += tileSize) {
            this.add.image(x, y, 'tiles').setOrigin(0).setScale(2);
        }
    }


        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        player = this.physics.add.sprite(100, 100, 'player').setScale(2);
        player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(player);

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

        obstacles = this.physics.add.staticGroup();

        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(100, worldWidth - 100);
            const y = Phaser.Math.Between(100, worldHeight - 100);

            const type = 'crate';
            const obstacle = obstacles.create(x, y, type);
            obstacle.setScale(2);
            obstacle.refreshBody();
        }

        this.physics.add.collider(player, obstacles);

        cursors = this.input.keyboard.createCursorKeys();
    }

    function update() {
        player.setVelocity(0);

        if (cursors.left.isDown) {
            player.setVelocityX(-200);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(200);
            player.anims.play('right', true);
        } else if (cursors.up.isDown) {
            player.setVelocityY(-200);
            player.anims.play('up', true);
        } else if (cursors.down.isDown) {
            player.setVelocityY(200);
            player.anims.play('down', true);
        } else {
            player.anims.stop();
        }
    }

    function createObstacle(scene, x, y, width, height) {
        const obstacle = scene.add.rectangle(x, y, width, height, 0x8B0000);
        scene.physics.add.existing(obstacle, true);
        obstacles.add(obstacle);
    }
});

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
}, []);

    return (
        <div className="game-container">
            <div id="phaser-game" style={{ width: '800px', height: '600px' }}></div>
        </div>
    );
}