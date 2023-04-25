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
        if (body_coor != null && (Object.keys(body_coor.length != 0))) {
          console.log(`Drawing body with coordinates:`);
          console.log(body_coor);
          console.log(body_coor.length);
          drawBody(body_coor);
          
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
      bodyID = null;
      return null;
    }
    else{
      let body_id = null;
      // let body_id = frame.people[0].body_id;
      // let closest = frame.people[0].joints[0].position.z;
      for (person of frame.people) {
        console.log(person.joints[14].position.y)
        console.log(person.joints[12].position.y)
      if (person.joints[14].position.y < person.joints[12].position.y) {
      // if (person.joints[0].position.z < closest) {
        body_id = person.body_id;
        // closest = person.joints[0].position.z;
      }
    }
    console.log(`Changed body_id to ${body_id}`);
    return body_id;
    }
    
  },

  get_body_coordinates: function (frame) {
    let coordinates = {};
    let added = false;

    if (frame.people.length < 1) {
      console.log("No body detected");
      // bodyID = null;
      return null;
    }
    for (person of frame.people) {

      if (person.body_id === bodyID) {
        for (let part in body_index) {
            let index = body_index[part];
            let x = window.innerWidth - ((person.joints[index].pixel.x)/1280 * 1920);
            let y = ((person.joints[index].pixel.y)/720) * 1080;
            coordinates[part] = [x, y]
          }
          added = true;
      }
    }
    // console.log(coordinates);
      if (!added) {
        console.log("No matching body ID");
        // bodyID = null;
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
          810, 300,
          810, 1050,
          1110, 1050,
          1110, 300,
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


        
    }
    update() {

      let state = true;

      if (body_coor != null && (Object.keys(body_coor.length != 0))) {

        console.log(`Hole points ${this.hole.points}`);

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
        this.input.keyboard.on('keydown-ENTER', () => {
          this.scene.start('playGame');
        });
    }
}
class Scene3 extends Phaser.Scene {
    constructor () {
        super('playGame');
        let hole_coor = hole_coordinates()
        this.body1 = new Phaser.Geom.Polygon(hole_coor);


        this.body1 = new Phaser.Geom.Polygon([
          300, 300,
          1000, 300,
          1000, 900,
          300, 900,
        ]);
      //   this.body1 = new Phaser.Geom.Polygon([
      //     60 + 700, -40 + 300,
      //     250 + 700, -40 + 300,
      //     250 + 700, 0 + 300,
      //     60 + 700, 0 + 300,
      //     60 + 700, 200 + 300,
      //     60 + 700, 380 + 300,
      //     10 + 700, 380 + 300,
      //     10 + 700, 200 + 300,
      //     -10 + 700, 200 + 300,
      //     -10 + 700, 380 + 300,
      //     -60 + 700, 380 + 300,
      //     -60 + 700, 200 + 300,
      //     -60 + 700, 0 + 300,
      //     -250 + 700, 0 + 300,
      //     -250 + 700, -40 + 300,
      //     -60 + 700, -40 + 300,
      // ]);x

      //   this.head = new Phaser.Geom.Circle(0, -100,60);
      // this.hole = new Hole(this);
      // this.hole.render();
    }
    

    preload() {
        this.load.image('wall', 'assets/images/wall.webp');
        this.load.image('allblack', 'assets/images/hole.webp');
    }
    create() {
        let hole_coor = hole_coordinates()
        this.body1 = new Phaser.Geom.Polygon(hole_coor);
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

        if (body_coor !=  null && (Object.keys(body_coor.length != 0))) {

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
            setTimeout(() => {
              hole.clear();
              this.scene.start('Continue');
            }, 1000);
            // this.scene.start('Continue');
          }
          else {
            body_color = "rgba(64, 224, 208 , 0.8)";
          }
        }

    }
}

class Scene4 extends Phaser.Scene {
  constructor () {
      super('Continue');
      
  }

  preload() {
      this.load.image("background", "assets/images/hole-bg.png");
  }
  create() {
      // this.background = this.add.image(0, 0, "background");
      // this.background.setOrigin(0, 0);
      // this.background.displayHeight = window.innerHeight;
      // this.background.displayWidth = window.innerWidth;
      body_color = "rgba(64, 224, 208 , 0.8)";
      this.add.text(450,30, "New Hole Loading", {
        font: "50px Arial", 
        fill: "#000000"
    });

    let count = 7; // initial countdown value in seconds
        const countdownEl = this.add.text(10, 10, count, { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
    
        function updatetime() {
          count--;
          countdownEl.setText(count);
          if (count === 0) {
            this.time.removeEvent(timer); // stop the timer when countdown reaches 0
          }
        }
    
        const timer = this.time.addEvent({
          delay: 1000, // repeat every 1000 milliseconds (1 second)
          callback: updatetime,
          callbackScope: this,
          loop: true
        });

  }
  update() {
    if (count === 0) {
      this.scene.start('playGame');
    }
  }
}

function handCheck() {
    if ((body_coor != undefined) && (body_coor != null) && (Object.keys(body_coor.length != 0))) {
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
  //var num = 15;
  switch (num) {
    case 1: // person center
      var coordinates = [
        900, 380, 
        1020, 380, 
        1020, 500, 
        1210, 500, 
        1210, 590, 
        1020, 590, 
        1020, 740, 
        1020, 920, 
        900, 920, 
        900, 740, 
        900, 590, 
        710, 590, 
        710, 500, 
        900, 500
      ]
      break;
    case 2: // center rectangle
      var coordinates = [
        810, 300,
        810, 900,
        1110, 900,
        1110, 300,
      ];
      break;
    case 3: // left rectangle
      var coordinates = [
        410, 300,
        410, 900,
        710, 900,
        710, 300,
      ];
      break;
    case 4: // right rectangle
      var coordinates = [
        1210, 300,
        1210, 900,
        1510, 900,
        1510, 300,
      ];
      break;
    case 5: // center triangle
      var coordinates = [
        710, 900,
        1210, 900,
        960, 200,
      ];
      break;
    case 6: // left triangle
      var coordinates = [
        310, 900,
        810, 900,
        560, 200,
      ];
      break;
    case 7: // right triangle
      var coordinates = [
        1110, 900,
        1610, 900,
        1360, 200,
      ];
      break;
    case 8: // center square
      var coordinates = [
        810, 500,
        810, 900,
        1110, 900,
        1110, 500,
      ];
      break;
    case 9: // left square
      var coordinates = [
        410, 500,
        410, 900,
        710, 900,
        710, 500,
      ];
      break;
    case 10: // right square
      var coordinates = [
        1210, 500,
        1210, 900,
        1510, 900,
        1510, 500,
      ];
      break;
    case 11: // center quadrilateral
      var coordinates = [
        710, 900,
        1210, 900,
        1060, 500,
        850, 500,
      ];
      break;
    case 12: // left quadrilateral
      var coordinates = [
        310, 900,
        810, 900,
        660, 500,
        450, 500,
      ];
      break;
    case 13: // right quadrilateral
      var coordinates = [
        1110, 900,
        1610, 900,
        1460, 500,
        1250, 500,
      ];
      break;
    case 14: // person left
      var coordinates = [
        500, 380, 
        620, 380, 
        620, 500, 
        810, 500, 
        810, 590, 
        620, 590, 
        620, 740, 
        620, 920, 
        500, 920, 
        500, 740, 
        500, 590, 
        310, 590, 
        310, 500, 
        500, 500
      ]
      break;
    case 15: // person right
      var coordinates = [
        1300, 380, 
        1420, 380, 
        1420, 500, 
        1610, 500, 
        1610, 590, 
        1420, 590, 
        1420, 740, 
        1420, 920, 
        1300, 920, 
        1300, 740, 
        1300, 590, 
        1110, 590, 
        1110, 500, 
        1300, 500
      ]
      break;
  };
  return coordinates;
}


const config = {
    type:  Phaser.AUTO,
    height: window.innerHeight,
    width: window.innerWidth,
    backgroundColor: '#FFFFFF',
    scene: [Scene1, Scene2, Scene3, Scene4]
}

window.onload = function() {
    var game = new Phaser.Game(config);
}

$(document).ready(function() {
    frames.start();
    twod.start();
});


