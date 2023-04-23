class Scene1 extends Phaser.Scene {
    constructor () {
        super('startGame');
    }

    preload() {
        this.load.image("background", "assets/images/hole-bg.png");
    }
    create() {
        // this.add.text(100, 100, "Loading game...");
        this.background = this.add.image(0, 0, "background");
        this.background.setOrigin(0, 0);
        this.background.displayHeight = window.innerHeight;
        this.background.displayWidth = window.innerWidth;
        // this.background.scaleX = window.innerWidth;

        this.add.text(430,300, "HOLE IN THE WALL", {
            font: "70px Arial", 
            fill: "#ff0044"
        });
        this.add.text(500,450, "RAISE YOUR HAND TO PLAY", {
            font: "30px Arial", 
            fill: "yellow"
        });

        //start game
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('playGame');
          });
    }
}

class Scene2 extends Phaser.Scene {
    constructor () {
        super('playGame');
    }

    preload() {
        this.load.image('wall', 'assets/images/wall.webp');
        this.load.image('allblack', 'assets/images/hole.webp');
    }
    create() {
        this.tile = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'wall');
        // tile.setOrigin(0.5);
        // this.tile.displayWidth = window.innerWidth/1000;
        // this.tile.displayHeight = window.innerHeight/1000;
        this.tile.scaleX = 0.1;
        this.tile.scaleY = 0.1;
        this.tile.depth = 0;

        // create a new graphics object
        this.graphics = this.add.graphics();

        // set the fill color and alpha
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.lineStyle(4, 0x000000, 1);

        // draw the human body shape using the graphics object
        this.graphics.beginPath();

        //draw head
        this.graphics.arc(0, -100, 50, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false);
        this.graphics.moveTo(0, -50);
        this.graphics.lineTo(80, -50);

        //draw right arm
        this.graphics.lineTo(200, -50);
        this.graphics.lineTo(200, -20);
        this.graphics.lineTo(80, -20);

        //draw right leg
        this.graphics.lineTo(80, 150);
        this.graphics.lineTo(80, 300);
        this.graphics.lineTo(50, 300);
        this.graphics.lineTo(50, 150);


        //draw left leg
        this.graphics.lineTo(-50, 150);
        this.graphics.lineTo(-50, 300);
        this.graphics.lineTo(-80, 300);
        this.graphics.lineTo(-80, 150);

        //draw left arm
        this.graphics.lineTo(-80, -20);
        this.graphics.lineTo(-200, -20);
        this.graphics.lineTo(-200, -50);
        this.graphics.lineTo(-80, -50);

        this.graphics.lineTo(0, -50);
        this.graphics.closePath();
        this.graphics.strokePath();
        this.graphics.fillPath();
        this.graphics.depth = 2;

        this.graphics.x = window.innerWidth / 2;
        this.graphics.y = window.innerHeight / 2;
        this.graphics.scaleX = 0.1;
        this.graphics.scaleY = 0.1;


        this.graphics.setInteractive();
        // this.graphics.on('pointerdown', function(pointer) {
        //     check if the graphics object contains the pointer position
        //     if (this.graphics.getBounds().contains(pointer.x, pointer.y)) {
        //       console.log('clicked on graphics');
        //     }
        //   }, this);

        this.graphics.setInteractive();
        this.graphics.on('pointerdown', function(pointer) {
            console.log('Graphics clicked!');
        }, this);

    }
    update() {

        if (this.tile.displayWidth < window.innerWidth) {
            // this.tile.displayHeight += window.innerHeight/250;
            // this.tile.displayWidth += window.innerWidth/250;
            this.tile.scaleX += 0.005;
            this.tile.scaleY += 0.005;
            this.graphics.scaleX += 0.005;
            this.graphics.scaleY += 0.005;
        }
        
    }
}


const config = {
    type:  Phaser.AUTO,
    height: window.innerHeight,
    width: window.innerWidth,
    backgroundColor: '#FFFFFF',
    scene: [Scene1, Scene2]
}

window.onload = function() {
    var game = new Phaser.Game(config);
}
