let host = "cpsc484-03.yale.internal:8888";

let frames = {
  socket: null,

  start: function() {
    let url = "ws://" + host + "/frames";
    frames.socket = new WebSocket(url);
    frames.socket.onmessage = function (event) {
      let coordinates = frames.get_body_coordinates(JSON.parse(event.data));
      if (coordinates !== null) {
        console.log("Drawing body");
        drawBody(coordinates);
      }
      else {
        console.log("No coordinates to draw");
      }
    }
  },

  get_body_coordinates: function (frame) {
    let coordinates = {};
    if (frame.people.length < 1) {
        console.log("No body detected");
        return null;
    }

    let body_index = {
        'PELVIS': 0,
        'NECK': 3,
        'ELBOW_LEFT': 6,
        'ELBOW_RIGHT': 13,
        'SHOULDER_LEFT': 5,
        'SHOULDER_RIGHT': 12,
        'HEAD': 26,
        'WRIST_LEFT': 7,
        'WRIST_RIGHT': 14,
        'FOOT_LEFT': 21,
        'FOOT_RIGHT': 25,
        'HIP_LEFT': 18,
        'KNEE_LEFT': 19,
        'ANKLE_LEFT': 20,
        'HIP_RIGHT': 22,
        'KNEE_RIGHT': 23,
        'ANKLE_RIGHT': 24,
        'EAR_LEFT': 29,
        'EAR_RIGHT': 31,
    };

    for (let part in body_index) {
        let index = body_index[part];
        let x = window.innerWidth - (frame.people[0].joints[index].pixel.x);
        let y = (frame.people[0].joints[index].pixel.y);
        // let z = frame.people[0].joints[index].position.z;
        coordinates[part] = [x, y]
        console.log(part + ": " + coordinates[part]);
      }
        //hardcoded coordinates for testing
        // coordinates['PELVIS'] = [100, 200];
        // coordinates['NECK'] = [100, 150];
        // coordinates['HEAD'] = [100, 100];
        // coordinates['EAR_LEFT'] = [65, 90];
        // coordinates['EAR_RIGHT'] = [135, 90];
        // coordinates['SHOULDER_LEFT'] = [75, 140];
        // coordinates['ELBOW_LEFT'] = [50, 140];
        // coordinates['WRIST_LEFT'] = [30, 140];
        // coordinates['SHOULDER_RIGHT'] = [125, 140];
        // coordinates['ELBOW_RIGHT'] = [150, 140];
        // coordinates['WRIST_RIGHT'] = [170, 140];
        // coordinates['HIP_LEFT'] = [80, 220];
        // coordinates['KNEE_LEFT'] = [80, 260];
        // coordinates['ANKLE_LEFT'] = [80, 290];  
        // coordinates['HIP_RIGHT'] = [120, 220];
        // coordinates['KNEE_RIGHT'] = [120, 260];
        // coordinates['ANKLE_RIGHT'] = [120, 290];
        // coordinates['FOOT_LEFT'] = [75, 310];
        // coordinates['FOOT_RIGHT'] = [125, 310];
        // console.log(coordinates);
  
      return coordinates;
    }
  };
  
  let twod = {
    socket: null,
  
    start: function() {
      var url = "ws://" + host + "/twod";
      twod.socket = new WebSocket(url);
      twod.socket.onmessage = function(event) {
        twod.show(JSON.parse(event.data));
      }
    },
  
    show: function(twod) {
      // Set the src of an element with id 'twod' instead of class 'twod'
      $('#twod').attr("src", 'data:image/png;base64,'+twod.src);
    }
  };
  
  function drawBody(coordinates) {
    let canvas = document.getElementById("my-canvas");
    let ctx = canvas.getContext("2d");
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(64, 224, 208, 0.8)";
    ctx.lineWidth = 10;
    ctx.fillStyle = "rgba(64, 224, 208, 0.8)";
    
    // Draw the body
    ctx.beginPath();
  
    let radius = (coordinates['EAR_RIGHT'][0] - coordinates['EAR_LEFT'][0]) / 2.5;
    if (radius < 0) {
      radius = -radius;
    }
    console.log("radius: " + radius)
    // Draw the head
    ctx.arc(coordinates['HEAD'][0], coordinates['HEAD'][1], radius, 0, 2*Math.PI);
    
    // Draw the torso
    ctx.moveTo(coordinates['SHOULDER_LEFT'][0], coordinates['SHOULDER_LEFT'][1]);
    ctx.lineTo(coordinates['SHOULDER_RIGHT'][0], coordinates['SHOULDER_RIGHT'][1]);
    ctx.lineTo(coordinates['HIP_RIGHT'][0], coordinates['HIP_RIGHT'][1]);
    ctx.lineTo(coordinates['HIP_LEFT'][0], coordinates['HIP_LEFT'][1]);
    ctx.lineTo(coordinates['SHOULDER_LEFT'][0], coordinates['SHOULDER_LEFT'][1]);
    
    // Draw the left arm
    ctx.moveTo(coordinates['SHOULDER_LEFT'][0], coordinates['SHOULDER_LEFT'][1]);
    ctx.lineTo(coordinates['ELBOW_LEFT'][0], coordinates['ELBOW_LEFT'][1]);
    ctx.lineTo(coordinates['WRIST_LEFT'][0], coordinates['WRIST_LEFT'][1]);
    
    // Draw the right arm
    ctx.moveTo(coordinates['SHOULDER_RIGHT'][0], coordinates['SHOULDER_RIGHT'][1]);
    ctx.lineTo(coordinates['ELBOW_RIGHT'][0], coordinates['ELBOW_RIGHT'][1]);
    ctx.lineTo(coordinates['WRIST_RIGHT'][0], coordinates['WRIST_RIGHT'][1]);
    
    // Draw the left leg
    ctx.moveTo(coordinates['HIP_LEFT'][0], coordinates['HIP_LEFT'][1]);
    ctx.lineTo(coordinates['KNEE_LEFT'][0], coordinates['KNEE_LEFT'][1]);
    ctx.lineTo(coordinates['ANKLE_LEFT'][0], coordinates['ANKLE_LEFT'][1]);
    
    // Draw the right leg
    ctx.moveTo(coordinates['HIP_RIGHT'][0], coordinates['HIP_RIGHT'][1]);
    ctx.lineTo(coordinates['KNEE_RIGHT'][0], coordinates['KNEE_RIGHT'][1]);
    ctx.lineTo(coordinates['ANKLE_RIGHT'][0], coordinates['ANKLE_RIGHT'][1]);
  
    // Stroke and fill the path
    ctx.stroke();
    ctx.fill();
  }

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
        frames.start();
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


$(document).ready(function() {
  twod.start();
});


