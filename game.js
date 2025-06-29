const config = {
    type: Phaser.AUTO,
    width: 800, // Initial width, will adjust for tilemap later
    height: 600, // Initial height, will adjust for tilemap later
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    pixelArt: true // Good for tilemaps
};

const game = new Phaser.Game(config);

function preload() {
    // Asset loading will go here
    console.log("Preload function called");
}

function create() {
    // Game object creation will go here
    this.add.text(50, 50, 'Basic Phaser Game Setup!', { fontSize: '24px', fill: '#fff' });
    console.log("Create function called");
}

function update() {
    // Game logic loop
}
