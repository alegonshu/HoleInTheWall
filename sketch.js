let host = "cpsc484-03.yale.internal:8888";
$(document).ready(function() {
  frames.start();
  twod.start();
});

let frames = {
  socket: null,

  start: function() {
    let url = "ws://" + host + "/frames";
    frames.socket = new WebSocket(url);
    frames.socket.onmessage = function (event) {
      let coordinates = frames.get_body_coordinates(JSON.parse(event.data));
      if (coordinates !== null) {
        console.log("Drawing body");
        drawPoint(context, coordinates['PELVIS'][0], coordinates['PELVIS'][1], 'A', 'red', 1, );
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
      let x = frame.people[0].joints[index].position.x;
      let y = frame.people[0].joints[index].position.y;
      let z = frame.people[0].joints[index].position.z;
      coordinates[part] = [x, y, z]
    }
      //hardcoded coordinates for testing
      // coordinates['PELVIS'] = [100, 200, 10];
      // coordinates['NECK'] = [100, 150, 10];
      // coordinates['HEAD'] = [100, 100, 10];
      // coordinates['EAR_LEFT'] = [65, 90, 10];
      // coordinates['EAR_RIGHT'] = [135, 90, 10];
      // coordinates['SHOULDER_LEFT'] = [75, 140, 10];
      // coordinates['ELBOW_LEFT'] = [50, 140, 10];
      // coordinates['WRIST_LEFT'] = [30, 140, 10];
      // coordinates['SHOULDER_RIGHT'] = [125, 140, 10];
      // coordinates['ELBOW_RIGHT'] = [150, 140, 10];
      // coordinates['WRIST_RIGHT'] = [170, 140, 10];
      // coordinates['HIP_LEFT'] = [80, 220, 10];
      // coordinates['KNEE_LEFT'] = [80, 260, 10];
      // coordinates['ANKLE_LEFT'] = [80, 290, 10];
      // coordinates['HIP_RIGHT'] = [120, 220, 10];
      // coordinates['KNEE_RIGHT'] = [120, 260, 10];
      // coordinates['ANKLE_RIGHT'] = [120, 290, 10];
      // coordinates['FOOT_LEFT'] = [75, 310, 10];
      // coordinates['FOOT_RIGHT'] = [125, 310, 10];
      //   console.log(coordinates);

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
  ctx.strokeStyle = "rgba(64, 224, 208, 0.5)";
  ctx.lineWidth = 20;
  ctx.fillStyle = "rgba(64, 224, 208, 0.5)";
  
  // Draw the body
  console.log('sketching body');
  ctx.beginPath();
  
  let radius = (coordinates['EAR_RIGHT'][0] - coordinates['EAR_LEFT'][0]) / 2.5;
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

