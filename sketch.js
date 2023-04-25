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
  // 'FOOT_LEFT': 21,
  // 'FOOT_RIGHT': 25,
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
          // console.log(`Drawing body with coordinates:`);
          // console.log(body_coor);
          // console.log(body_coor.length);
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
        //console.log(person.joints[14].position.y)
        //console.log(person.joints[12].position.y)
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

        this.add.text(450,450, "HOLE IN THE WALL", {
            font: "100px Title", 
            fill: "#ff0044"
        });
        this.add.text(610,550, "RAISE YOUR RIGHT HAND TO PLAY", {
            font: "30px Gameplay", 
            fill: "yellow"
        });
        
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('Instructions');
          });
    }
    update() {
        // console.log(verify);
        if (handCheck()) {
          this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('Instructions');
          });
            setTimeout(() => {
                if (verify) {
                    this.scene.start('Instructions');
                }
            }, 1000);
        }
    }
}
class Scene2 extends Phaser.Scene {
    constructor () {
        super('Instructions');

        this.hole = new Phaser.Geom.Polygon([
          110, 450,
          110, 1200,
          410, 1200,
          410, 450,
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

        this.add.text(200,100, "INSTRUCTIONS", {
          font: "70px Title", 
          fill: "#000000"
      });

        this.add.text(200,200, "A brick wall with a black hole will appear on the screen.", {
            font: "35px Monaco", 
            fill: "#ff0044"
        });
        this.add.text(200,300, "Position yourself such that you fit through the hole before the timer ends.", {
            font: "35px Monaco", 
            fill: "#ff0044"
        });
        this.add.text(600,400, "Move left or right to change your position on the screen", {
          font: "35px Monaco",
          fill: "#ff0044",
          fontStyle: "italic"
        });
        this.add.text(600,500, "Move toward or away from the screen to change character size", {
          font: "35px Monaco", 
          fill: "#ff0044",
          fontStyle: "italic"
        });
        this.add.text(500,600, "Be quick and precise to avoid being hit by the walls.", {
            font: "35px Monaco", 
            fill: "#ff0044"
        });
        this.add.text(500,700, "Good luck and have fun!", {
            font: "35px Monaco", 
            fill: "#ff0044"
        });
        this.add.text(500,900, "<- Position yourself in the hole on the left to begin...", {
          font: "35px Monaco", 
          fill: "#000000",
          fontWeight: "bold"
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

        //console.log(this.hole.points);

        for (let part in body_index) {
          let current_point = new Phaser.Geom.Point(body_coor[part][0], body_coor[part][1]);

          if (!Phaser.Geom.Polygon.ContainsPoint(this.hole, current_point)) 
          {
            //console.log(`${part}: ${body_coor[part]} is not in the hole`);
            state = false;
          }
        }
      }
      else {
        state = false;
      }
      if (state == true) {
        //console.log("You are in the hole");
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

        this.count = 10; 
        this.body1 = new Phaser.Geom.Polygon([
          300, 300,
          1000, 300,
          1000, 900,
          300, 900,
        ]);
    }
    

    preload() {
        this.load.image('wall', 'assets/images/wall.webp');
        this.load.image('allblack', 'assets/images/hole.webp');
    }
    create() {
        let hole_coor = hole_coordinates()
        // console.log(hole_coor);
        this.body1 = new Phaser.Geom.Polygon(hole_coor);
        this.tile = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'wall');
        // tile.setOrigin(0.5);

        this.tile.displayHeight = window.innerHeight;
        this.tile.displayWidth = window.innerWidth;
        this.tile.depth = 0;

        //this.graphics.clear();
        this.graphics = this.add.graphics();
        this.graphics.setName("hole");
        this.graphics.depth = 2;
        this.graphics.scaleX = 1;
        this.graphics.scaleY = 1;

        this.graphics.fillStyle(0x000000, 1);
        this.graphics.lineStyle(4, 0x000000, 1);
        this.graphics.fillPoints(this.body1.points, true);

        this.count = 10;
        this.countdownEl = this.add.text(400, 100, this.count, 
          {
            font: "100px Arial", 
            fill: "#000000"
        });
        this.countdownEl.depth = 4;

        this.countCircle = this.add.circle(425, 147, 100, 0xffffff)
        this.countCircle.depth = 3;
    
        function updatetime() {
          this.count--;
          this.countdownEl.setText(this.count);
          if (this.count === 0) {
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
        var hole = this.children.getByName("hole");
        let state = true;

        if (this.count === 0) {
          console.log("Loading gameover");
          this.scene.start('Over');
          
        }
        else{
        if (body_coor !=  null && (Object.keys(body_coor.length != 0))) {

          //console.log(this.body1.points);

          for (let part in body_index) {
            let current_point = new Phaser.Geom.Point(body_coor[part][0], body_coor[part][1]);

            if (!Phaser.Geom.Polygon.ContainsPoint(this.body1, current_point)) 
            {
              state = false;
              //console.log(`${part}:${current_point.x}) not in hole`);
            }
            else {
              //console.log(`${part}:(${current_point.x}) in hole`);
            }
          }
        }
        else {
          state = false;
        }

          if (state == true) {
            console.log(`state is ${state}`);
            body_color = "rgba(0, 0, 250, 0.8)";
            setTimeout(() => {
              console.log("waiting sec");
              this.scene.start('Continue');
              
            }, 2000);
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
      this.count = 4;

  }

  preload() {
      this.load.image("background", "assets/images/hole-bg.png");
  }
  create() {
      // this.background = this.add.image(0, 0, "background");
      // this.background.setOrigin(0, 0);
      // this.background.displayHeight = window.innerHeight;
      // this.background.displayWidth = window.innerWidth;
      this.scene.stop('playGame');
      body_color = "rgba(64, 224, 208 , 0.8)";
      this.add.text(450,100, "New Hole Loading", {
        font: "100px Arial", 
        fill: "#000000"
    });
        this.count = 4;
        this.countdownEl = this.add.text(100, 100, this.count, 
          {
            font: "50px Arial", 
            fill: "#000000"
        });
        this.countdownEl.depth = 3;
    
        function updatetime() {
          this.count--;
          this.countdownEl.setText(this.count);
          if (this.count === 0) {
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
    if (this.count === 0) {
      this.scene.start('playGame');
    }
  }
}

class Scene5 extends Phaser.Scene {
  constructor () {
      super('Over');
      this.count = 10;

  }

  preload() {
      this.load.image("gameover", "assets/images/gameover.jpeg");
  }
  create() {
    this.background = this.add.image(0, 0, "gameover");
    this.background.setOrigin(0, 0);
    this.background.displayHeight = window.innerHeight;
    this.background.displayWidth = window.innerWidth;
    this.background.depth = 0;

    //   body_color = "rgba(64, 224, 208 , 0.8)";
    //   this.add.text(450,100, "Game Over", {
    //     font: "100px Arial", 
    //     fill: "#000000"
    // });
      this.add.text(700,750, "Raise your hand to restart", {
        font: "50px Arial", 
        fill: "#ffffff"
    });
        this.count = 10;
        this.countdownEl = this.add.text(570, 850, `Returning to the home screen in ... ${this.count}s`, 
          {
            font: "50px Arial", 
            fill: "#ffffff"
        });
        this.countdownEl.depth = 3;
    
        function updatetime() {
          this.count--;
          this.countdownEl.setText(`Returning to the home screen in ... ${this.count}s`);
          if (this.count === 0) {
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
    if (handCheck()) {
        setTimeout(() => {
            if (verify) {
                this.scene.start('Instructions');

            }
        }, 1000);
    }
    else{
      if (this.count === 0) {
        this.scene.start('startGame');
      }
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
  let max = 15;
  let num = Math.floor(Math.random() * max) + 1;
  //var num = 15;
  let coordinates = [];
  switch (num) {
    case 1: // person center
      coordinates = [
        900, 530,
        1020, 530,
        1020, 650,
        1210, 650,
        1210, 740,
        1020, 740,
        1020, 890,
        1020, 1070,
        900, 1070,
        900, 890,
        900, 740,
        710, 740,
        710, 650,
        900, 650
      ];
      break;
    case 2: // center rectangle
      coordinates = [
        810, 450,
        810, 1050,
        1110, 1050,
        1110, 450
      ];
      break;
    case 3: // left rectangle
      coordinates = [
        410, 450,
        410, 1050,
        710, 1050,
        710, 450
      ];
      break;
    case 4: // right rectangle
      coordinates = [
        1210, 450,
        1210, 1050,
        1510, 1050,
        1510, 450
      ];
      break;
    case 5: // center triangle
      coordinates = [
        710, 1050,
        1210, 1050,
        960, 350
      ];
      break;
    case 6: // left triangle
      coordinates = [
        310, 1050,
        810, 1050,
        560, 350
      ];
      break;
    case 7: // right triangle
      coordinates = [
        1110, 1050,
        1610, 1050,
        1360, 350
      ];
      break;
    case 8: // center square
      coordinates = [
        810, 650,
        810, 1050,
        1110, 1050,
        1110, 650
      ];
      break;
    case 9: // left square
      coordinates = [
        410, 650,
        410, 1050,
        710, 1050,
        710, 650
      ];
      break;
    case 10: // right square
      coordinates = [
        1210, 650,
        1210, 1050,
        1510, 1050,
        1510, 650
      ];
      break;
    case 11: // center quadrilateral
      coordinates = [
        710, 1050,
        1210, 1050,
        1060, 650,
        850, 650
      ];
      break;
    case 12: // left quadrilateral
      coordinates = [
        310, 1050, 
        810, 1050, 
        660, 650, 
        450, 650
      ];
      break;
    case 13: // right quadrilateral
      coordinates = [
        1110, 1050, 
        1610, 1050, 
        1460, 650, 
        1250, 650
      ];
      break;
    case 14: // person left
      coordinates = [
        500, 530,
        620, 530,
        620, 650,
        810, 650,
        810, 740,
        620, 740,
        620, 890,
        620, 1070,
        500, 1070,
        500, 890,
        500, 740,
        310, 740,
        310, 650,
        500, 650
        ];
      break;
    case 15: // person right
      coordinates = [
        1300, 530,
        1420, 530,
        1420, 650,
        1610, 650,
        1610, 740,
        1420, 740,
        1420, 890,
        1420, 1070,
        1300, 1070,
        1300, 890,
        1300, 740,
        1110, 740,
        1110, 650,
        1300, 650
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
    scene: [Scene1, Scene2, Scene3, Scene4, Scene5]
}

window.onload = function() {
    var game = new Phaser.Game(config);
}

$(document).ready(function() {
    frames.start();
    twod.start();
});


