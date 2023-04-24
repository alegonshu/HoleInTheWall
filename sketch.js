let host = "cpsc484-03.yale.internal:8888";
var body_coor = {};
var body_color = "rgba(64, 224, 208, 0.8) ";
let verify = false;

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

const canvas = document.getElementById('my-canvas');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let frames = {
  socket: null,

  start: function() {
    let url = "ws://" + host + "/frames";
    frames.socket = new WebSocket(url);
    frames.socket.onmessage = function (event) {
      let coordinates = frames.get_body_coordinates(JSON.parse(event.data));
      body_coor = coordinates;
      if (coordinates !== null) {
        // console.log("Drawing body");
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

    for (let part in body_index) {
        let index = body_index[part];
        let x = window.innerWidth - (frame.people[0].joints[index].pixel.x);
        let y = (frame.people[0].joints[index].pixel.y);
        coordinates[part] = [x, y]
      }
        // hardcoded coordinates for testing
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
        // coordinates['WRIST_RIGHT'] = [100, 140];
        // coordinates['HIP_LEFT'] = [80, 220];
        // coordinates['KNEE_LEFT'] = [80, 260];
        // coordinates['ANKLE_LEFT'] = [80, 200];  
        // coordinates['HIP_RIGHT'] = [120, 220];
        // coordinates['KNEE_RIGHT'] = [120, 260];
        // coordinates['ANKLE_RIGHT'] = [120, 290];
        // coordinates['FOOT_LEFT'] = [75, 310];
        // coordinates['FOOT_RIGHT'] = [125, 310];

        // for (let part in coordinates) {
        //   coordinates[part][0] += 620;
        //   coordinates[part][1] += 300;
        // console.log(coordinates);
        // }
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
    ctx.strokeStyle = body_color;
    ctx.lineWidth = 20;
    ctx.fillStyle = body_color;
    
    // Draw the body
    ctx.beginPath();
  
    let radius = (coordinates['EAR_RIGHT'][0] - coordinates['EAR_LEFT'][0]) / 2.5;
    if (radius < 0) {
      radius = -radius;
    }
    // console.log("radius: " + radius)
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

        this.add.text(350,300, "HOLE IN THE WALL", {
            font: "70px Arial", 
            fill: "#ff0044"
        });
        this.add.text(500,400, "RAISE YOUR RIGHT HAND TO PLAY", {
            font: "30px Arial", 
            fill: "yellow"
        });
        
        // console.log(body_coor[7][1], body_coor[12][1]);
        // start game
        // if (handCheck()) {
        //     this.scene.start('playGame');
        // }
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('Instructions');
          });
    }
    update() {
        console.log(verify);
        if (handCheck()) {
            setTimeout(() => {
                if (verify) {
                    this.scene.start('Instructions');
                }
            }, 2000);
        }
    }
}
class Scene2 extends Phaser.Scene {
    constructor () {
        super('Instructions');
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

        this.add.text(300,300, "A red wall with a black hole will begin to move towards you.", {
            font: "20px Arial", 
            fill: "#ff0044"
        });
        this.add.text(300,400, "Position yourself such that you fit through the hole.", {
            font: "20px Arial", 
            fill: "#ff0044"
        });
        this.add.text(300,500, "Be quick and precise to avoid being hit by the walls.", {
            font: "20px Arial", 
            fill: "#ff0044"
        });
        this.add.text(300,600, "Good luck and have fun!", {
            font: "20px Arial", 
            fill: "#ff0044"
        });
          
        
        // console.log(body_coor[7][1], body_coor[12][1]);
        // start game
        // if (handCheck()) {
        //     this.scene.start('playGame');
        // }
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('playGame');
          });
    }
    update() {
            setTimeout(() => {
                this.scene.start('playGame');
            }, 5000);
        }
}
class Scene3 extends Phaser.Scene {
    constructor () {
        super('playGame');

      //   this.body1 = new Phaser.Geom.Polygon([
      //     60, -40,
      //     250,-40,
      //     250,0,
      //     60,0,
      //     60,200,
      //     60,380,
      //     10,380,
      //     10,200,
      //     -10,200,
      //     -10,380,
      //     -60,380,
      //     -60,200,
      //     -60,0,
      //     -250,0,
      //     -250,-40,
      //     -60,-40,
      // ]);

      //   this.head = new Phaser.Geom.Circle(0, -100,60);
    }
    

    preload() {
        this.load.image('wall', 'assets/images/wall.webp');
        this.load.image('allblack', 'assets/images/hole.webp');
    }
    create() {
        this.tile = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'wall');
        // tile.setOrigin(0.5);

        this.tile.scaleX = 0.08;
        this.tile.scaleY = 0.08;
        this.tile.depth = 0;

        // create a new graphics object
        // const rect = new Phaser.Geom.Rectangle(-150, 0, 300, 570);
        
        
        // this.graphics = this.add.graphics();
        // this.graphics.setName("hole");

        // set the fill color and alpha
        // this.graphics.fillStyle(0x000000, 1);
        // this.graphics.lineStyle(4, 0x000000, 1);
        // this.hole.strokeRectShape(rect);
        // this.hole.fillRectShape(rect);

        // this.hole.fillPoints(this.body1.points, true);
        // this.hole.fillCircleShape(this.head);

        this.hole = new Hole(this);
        this.hole.render();

        // this.graphics.depth = 2;
        // this.graphics.x = window.innerWidth / 2;
        // this.graphics.y = window.innerHeight /2;
        // this.graphics.scaleX = 0.1;
        // this.graphics.scaleY = 0.1;


    }

    // update() {
    //   // this.hole.next();
    //   // this.hole.render();
    // }
    
    // update() {
    //     var hole = this.children.getByName("hole");

    //     if (hole.scaleX < 1) {
    //         this.tile.scaleX += 0.0025;
    //         this.tile.scaleY += 0.002;  
    //         hole.scaleX += 0.003;
    //         hole.scaleY += 0.003;
    //     }
    //     else {
    //       // -250, 0, 500, 570
    //       // const holeBounds = {
    //       //   x: hole.x,
    //       //   y: hole.y ,
    //       //   width: 300 * hole.scaleX,
    //       //   height: 570 * hole.scaleY,
    //       // };
    //       // console.log(holeBounds);
    //     //   console.log(body_coor[""][0]);
    //       let state = true;
    //       if (body_coor != null) {
    //         console.log(this.body1.points, this.head);
    //       for (let part in body_index) {
    //         let current_point = new Phaser.Geom.Point(body_coor[part][0]- window.innerWidth/2, body_coor[part][1]- window.innerHeight/2);
    //         if (!Phaser.Geom.Polygon.ContainsPoint(this.body1, current_point) && !Phaser.Geom.Circle.ContainsPoint(this.head, current_point)){
    //           state = false;
    //           console.log(`${part}:${current_point}) not in hole`);
    //         }
    //         else {
    //           console.log(`${part}:(${current_point}) in hole`);
    //         }
    //         // if (
    //         //   body_coor[part][0] >= holeBounds.x &&
    //         //   body_coor[part][1] >= holeBounds.y &&
    //         //   body_coor[part][0] <= holeBounds.x + holeBounds.width &&
    //         //   body_coor[part][1] <= holeBounds.y + holeBounds.height
    //         // ) {
    //         //   console.log(`${part}:(${body_coor[part][0]}, ${body_coor[part][1]}) in hole`);
    //         // } else {
    //         //   state = false;
    //         //   console.log(`${part}:(${body_coor[part][0]}, ${body_coor[part][1]}) not in hole`);
    //         // }
    //       }
    //       if (state) {
    //         body_color = "rgba(0, 0, 250, 0.8)";
    //       }
    //       else {
    //         body_color = "rgba(64, 224, 208 , 0.8)";
    //       }
    //     }
    //     }
    // }
}

function handCheck() {
    if ((Object.keys(body_coor).length !== 0) && (body_coor != undefined)) {
            if (body_coor['WRIST_RIGHT'][1] < body_coor['SHOULDER_RIGHT'][1]) {
                verify = true;
                return true;
            }
            else {
                return false;
            }
    }
}

class Hole {
  constructor(scene) {
    this.scene = scene;
    this.graphics = this.scene.add.graphics();;
    this.count = 1;
    this.max = 4;
  }

  render() {
    this.graphics.clear();
    this.graphics.setName("hole");
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.lineStyle(4, 0x000000, 1);
    this.graphics.depth = 2;
    this.graphics.x = window.innerWidth / 2;
    this.graphics.y = window.innerHeight /2;
    this.graphics.scaleX = 0.1;
    this.graphics.scaleY = 0.1;

    switch (this.count) {
      case 1: // person
        var body = new Phaser.Geom.Polygon([
          60, -40,
          250,-40,
          250,0,
          60,0,
          60,200,
          60,380,
          10,380,
          10,200,
          -10,200,
          -10,380,
          -60,380,
          -60,200,
          -60,0,
          -250,0,
          -250,-40,
          -60,-40,
        ]);
        this.graphics.fillPoints(body.points, true);
        
        let head = new Phaser.Geom.Circle(0, -100,60);
        this.graphics.fillCircleShape(head);
        break;
      case 2: // center rectangle
        var body = new Phaser.Geom.Polygon([
          -100, -200,
          -100, 400,
          100, 400,
          100, -200,
        ]);

        this.graphics.fillPoints(body.points, true);
        break;
      case 3: // left rectangle
        var body = new Phaser.Geom.Polygon([
          -500, -200,
          -500, 400,
          -300, 400,
          -300, -200,
        ]);

        this.graphics.fillPoints(body.points, true);
        break;
      case 4: // right rectangle
        var body = new Phaser.Geom.Polygon([
          300, -200,
          300, 400,
          500, 400,
          500, -200,
        ]);

        this.graphics.fillPoints(body.points, true);
        break;
    }
  }

  next() {
    this.count = this.count + 1;
    if (this.count > this. max){
      this.count = 1;
    }
  }
}

const config = {
    type:  Phaser.AUTO,
    height: window.innerHeight,
    width: window.innerWidth,
    backgroundColor: '#FFFFFF',
    scene: [Scene1, Scene2, Scene3]
}

window.onload = function() {
    var game = new Phaser.Game(config);
}

$(document).ready(function() {
    frames.start();
    twod.start();
});


