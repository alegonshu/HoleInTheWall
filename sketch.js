var host = "cpsc484-03.yale.internal";
$(document).ready(function() {
  frames.start();
  twod.start();
});

var frames = {
  socket: null,

  start: function() {
    var url = "ws://" + host + "/frames";
    frames.socket = new WebSocket(url);
    frames.socket.onmessage = function (event) {
      var coordinates = frames.get_body_coordinates(JSON.parse(event.data));
      if (coordinates !== null) {
        sendCoordinates(coordinates);
      }
    }
  },

  get_body_coordinates: function (frame) {
    var coordinates = {};
    if (frame.people.length < 1) {
        return null;
    }

    var body_index = {
        'PELVIS': 0,
        'HEAD': 26,
        'WRIST_LEFT': 7,
        'WRIST_RIGHT': 14,
        'FOOT_LEFT': 21,
        'FOOT_RIGHT': 25
    };

    for (let part in body_index) {
        let index = body_index[part];
        let x = frame.people[0].joints[index].position.x;
        let y = frame.people[0].joints[index].position.y;
        let z = frame.people[0].joints[index].position.z;
        coordinates[part] = [x, y, z]
    }

    return coordinates;
  }
};

var twod = {
  socket: null,

  start: function() {
    var url = "ws://" + host + "/twod";
    twod.socket = new WebSocket(url);
    twod.socket.onmessage = function(event) {
      twod.show(JSON.parse(event.data));
    }
  },

  show: function(twod) {
    $('.twod').attr("src", 'data:image/pnjpegg;base64,'+twod.src);
  }
};