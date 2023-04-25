let host = "cpsc484-03.yale.internal:8888";
var body_coor = null;
var body_color = "rgba(64, 224, 208, 0.8) ";
let verify = false;
var bodyID = null;
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

      if (bodyID === null) {
        bodyID = frames.get_body_id(JSON.parse(event.data));
      }
      else {
        let coordinates = frames.get_body_coordinates(JSON.parse(event.data));
        body_coor = coordinates;
        if (coordinates !== null && coordinates !== {}) {
          
          drawBody(coordinates);
        }
        else {
          console.log("No coordinates to draw");
        }
      }
    }
  },

  get_body_id: function (frame) {
    if (frame.people.length < 1) {
      console.log("No body id");
      return null;
    }
    else{
      let body_id = frame.people[0].body_id;
      let closest = frame.people[0].joints[0].position.z;
      for (person of frame.people) {
        // console.log(person);
      if (person.joints[0].position.z < closest) {
        body_id = person.body_id;
        closest = person.joints[0].position.z;
      }
    }
    console.log(`Changed body_id to ${body_id}`);
    return body_id;
    }
    
  },

  get_body_coordinates: function (frame) {
    let coordinates = {};

    if (frame.people.length < 1) {
      console.log("No body detected");
      bodyID = null;
      return null;
    }
    for (person of frame.people) {

      if (person.body_id === bodyID) {
        for (let part in body_index) {
            let index = body_index[part];
            let x = window.innerWidth - (person.joints[index].pixel.x);
            let y = (person.joints[index].pixel.y);
            coordinates[part] = [x, y]
          }
      }
    }
    console.log(coordinates);
      if (coordinates === {}) {
        bodyID = null;
        return null;
      }
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
        this.background = this.add.image(0, 0, "background");
        this.background.setOrigin(0, 0);
        this.background.displayHeight = window.innerHeight;
        this.background.displayWidth = window.innerWidth;

        this.add.text(350,300, "HOLE IN THE WALL", {
            font: "70px Arial", 
            fill: "#ff0044"
        });
        this.add.text(500,400, "RAISE YOUR RIGHT HAND TO PLAY", {
            font: "30px Arial", 
            fill: "yellow"
        });
        
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('Instructions');
          });
    }
    update() {
        // console.log(verify);
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

        this.hole = new Phaser.Geom.Polygon([
          500, 300,
          800, 300,
          800, 900,
          500, 900,
        ]);

    }

    preload() {
        this.load.image("background", "assets/images/hole-bg.png");
    }
    create() {
        // this.background = this.add.image(0, 0, "background");
        // this.background.setOrigin(0, 0);
        // this.background.displayHeight = window.innerHeight;
        // this.background.displayWidth = window.innerWidth;

        this.add.text(450,30, "INSTRUCTIONS", {
          font: "50px Arial", 
          fill: "#000000"
      });

        this.add.text(400,100, "A brick wall with a black hole will appear on the screen.", {
            font: "20px Arial", 
            fill: "#ff0044"
        });
        this.add.text(400,130, "Position yourself such that you fit through the hole by the end of the time.", {
            font: "20px Arial", 
            fill: "#ff0044"
        });
        this.add.text(400,160, "Be quick and precise to avoid being hit by the walls.", {
            font: "20px Arial", 
            fill: "#ff0044"
        });
        this.add.text(400,190, "Good luck and have fun!", {
            font: "20px Arial", 
            fill: "#ff0044"
        });
        this.add.text(450,220, "Position yourself in the hole to begin", {
          font: "25px Arial", 
          fill: "#000000"
      });
          
        this.graphics = this.add.graphics();
        this.graphics.depth = 2;
        this.graphics.scaleX = 1;
        this.graphics.scaleY = 1;

        this.graphics.fillStyle(0x000000, 1);
        this.graphics.lineStyle(4, 0x000000, 1);
        this.graphics.fillPoints(this.hole.points, true);


        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('playGame');
          });
    }
    update() {

      let state = true;

      if (body_coor != null) {

        console.log(this.hole.points);

        for (let part in body_index) {
          let current_point = new Phaser.Geom.Point(body_coor[part][0], body_coor[part][1]);

          if (!Phaser.Geom.Polygon.ContainsPoint(this.hole, current_point)) 
          {
            state = false;
          }
        }
      }
      else {
        state = false;
      }
      if (state == true) {
        console.log("You are in the hole");
        this.scene.start('playGame');

        }
    }
}
class Scene3 extends Phaser.Scene {
    constructor () {
        super('playGame');
        var hole_coor = hole_coordinates()
        // this.body1 = new Phaser.Geom.Polygon(hole_coor);


        // this.body1 = new Phaser.Geom.Polygon([
        //   300, 300,
        //   1000, 300,
        //   1000, 900,
        //   300, 900,
        // ]);
        this.body1 = new Phaser.Geom.Polygon([
          60 + 700, -40 + 300,
          250 + 700, -40 + 300,
          250 + 700, 0 + 300,
          60 + 700, 0 + 300,
          60 + 700, 200 + 300,
          60 + 700, 380 + 300,
          10 + 700, 380 + 300,
          10 + 700, 200 + 300,
          -10 + 700, 200 + 300,
          -10 + 700, 380 + 300,
          -60 + 700, 380 + 300,
          -60 + 700, 200 + 300,
          -60 + 700, 0 + 300,
          -250 + 700, 0 + 300,
          -250 + 700, -40 + 300,
          -60 + 700, -40 + 300,
      ]);

      //   this.head = new Phaser.Geom.Circle(0, -100,60);
      // this.hole = new Hole(this);
      // this.hole.render();
    }
    

    preload() {
        this.load.image('wall', 'assets/images/wall.webp');
        this.load.image('allblack', 'assets/images/hole.webp');
    }
    create() {
        this.tile = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'wall');
        // tile.setOrigin(0.5);

        // this.tile.scaleX = 0.08;
        // this.tile.scaleY = 0.08;
        this.tile.displayHeight = window.innerHeight;
        this.tile.displayWidth = window.innerWidth;
        this.tile.depth = 0;

        this.graphics = this.add.graphics();
        this.graphics.setName("hole");
        this.graphics.depth = 2;
        // this.graphics.x = window.innerWidth / 2;
        // this.graphics.y = window.innerHeight /2;
        this.graphics.scaleX = 1;
        this.graphics.scaleY = 1;

        this.graphics.fillStyle(0x000000, 1);
        this.graphics.lineStyle(4, 0x000000, 1);
        this.graphics.fillPoints(this.body1.points, true);

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

        

        // this.graphics.depth = 2;
        // this.graphics.x = window.innerWidth / 2;
        // this.graphics.y = window.innerHeight /2;
        // this.graphics.scaleX = 0.1;
        // this.graphics.scaleY = 0.1;

    }

    update() {
        var hole = this.children.getByName("hole");
        let state = true;

        if (body_coor != null) {

          console.log(this.body1.points);

          for (let part in body_index) {
            let current_point = new Phaser.Geom.Point(body_coor[part][0], body_coor[part][1]);

            if (!Phaser.Geom.Polygon.ContainsPoint(this.body1, current_point)) 
                  // && !Phaser.Geom.Circle.ContainsPoint(this.head, current_point)
            {
              state = false;
              console.log(`${part}:${current_point.x}) not in hole`);
            }
            else {
              console.log(`${part}:(${current_point.x}) in hole`);
            }
          }

          if (state) {
            body_color = "rgba(0, 0, 250, 0.8)";
          }
          else {
            body_color = "rgba(64, 224, 208 , 0.8)";
          }
        }

    }
}

function handCheck() {
    if ((body_coor != undefined) && (body_coor != null) && (body_coor != {}) && (Object.keys(body_coor.length != 0))) {
            if  (body_coor['WRIST_RIGHT'][1] != undefined && body_coor['WRIST_LEFT'][1] != undefined 
                  && body_coor['SHOULDER_RIGHT'][1] != undefined && body_coor['SHOULDER_LEFT'][1] != undefined) 
            {
                if ((body_coor['WRIST_RIGHT'][1] < body_coor['SHOULDER_RIGHT'][1]) 
                || (body_coor['WRIST_LEFT'][1] < body_coor['SHOULDER_LEFT'][1])) 
                {
                    verify = true;
                    return true;
                }
                else {
                    verify = false;
                    return false;
              }
            }
  }
    verify = false;
    return false;
}

function hole_coordinates() {
  var max = 4;
  var num = Math.floor(Math.random() * max) + 1;
  switch (num) {
    case 1: // person
      var coordinates = [
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
      ];
      break;
    case 2: // center rectangle
      var coordinates = [
        -100, -200,
        -100, 400,
        100, 400,
        100, -200,
      ];
      break;
    case 3: // left rectangle
      var coordinates = [
        -500, -200,
        -500, 400,
        -300, 400,
        -300, -200,
      ];
      break;
    case 4: // right rectangle
      var coordinates = [
        300, -200,
        300, 400,
        500, 400,
        500, -200,
      ];
      break;
  };
  return coordinates;
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


