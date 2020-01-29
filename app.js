// ============
// IMPORTS

// Express
const express = require('express')
const app = express()

// Body Parser
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded());

// ============================================================================
// ==== Routing : Website

app.get('/', function (req, res) {
  res.sendFile('interface.html', {
    root: '.'
  })
})

app.use('/', express.static('public'));

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})


// ============================================================================
// ==== Arduino Board

let five = require("johnny-five");

let board = new five.Board();

const PINS = {
  RED: [10, 'A1'], GREEN: [9, 'A2'], BLUE: [11, 'A0']
};

// let flashRedLed = undefined;
let changeAmbiance = undefined;
let light = undefined;
let readInput = undefined;
let currentAmbiance = "Regular";
let blockAutoChange = false;
let printSensorState = undefined;
let dispostive_is_active = false;

function changeInputRange(value) {
  return Math.floor(value * 2);
}

sensorColor = {}

board.on("ready", function () {
  let leds = {};
  let sensor = {};

  for (let color in PINS) {
    let opt = { pin: PINS[color][1], freq: 250 };
    sensor[color] = new five.Light(opt);
    leds[color] = new five.Led(PINS[color][0]);

    if (color == 'BLUE') {
      sensor[color].on("change", function () {
        sensorColor[color] = this.level;

        potentialInput = [
          currentAmbiance,
          changeInputRange(sensor.RED.level),
          changeInputRange(sensor.GREEN.level),
          changeInputRange(sensor.BLUE.level)
        ];

        /*
        for (let c in PINS) {
          leds[c].brightness(Math.max(sensor[c].level, 0) * 90);
          console.log(c);
          console.log(sensor[c].level);

        }

        */

        

        if (!blockAutoChange && brain[potentialInput]) {
          readInput();
          findOutput();
          light();
        }
        
      });
    } else {
      sensor[color].on("change", function () {
        sensorColor[color] = this.level;
      });
    }
  }

  light = function () {
    let brightnesses = undefined;
    
    if (dispostive_is_active) {
      brightnesses = output;
    } else {
      brightnesses = { red: 0, green: 0, blue: 0 };
    }

    leds['RED'].brightness(brightnesses.red);
    leds['GREEN'].brightness(brightnesses.green);
    leds['BLUE'].brightness(brightnesses.blue);
  }

  readInput = function () {
    input = [
      currentAmbiance,
      changeInputRange(sensor.RED.level),
      changeInputRange(sensor.GREEN.level),
      changeInputRange(sensor.BLUE.level)
    ]
    blockAutoChange = false;
  }

  changeAmbiance = function (ambiance) {
    currentAmbiance = ambiance;
  }

  printSensorState = function() {
    console.log("Sensor : Red=" + sensor.RED.level
                    + " Green=" + sensor.GREEN.level
                    +  " Blue=" + sensor.BLUE.level);
  }
});



// ============================================================================
// ==== Routing : Requests



app.post('/request', function (req, res) {
  // console.log(req.body);
  if (req.body.type === 'ambiance') {
    if (changeAmbiance !== undefined) {
      changeAmbiance(req.body.ambiance);
    }
  } else if (req.body.type === 'on') {
    if (readInput !== undefined && light !== undefined) {
      dispostive_is_active = true;
      readInput();
      findOutput();
      light();
    }
  } else if (req.body.type === 'off') {
    dispostive_is_active = false;
    light();
  } else if (req.body.type === 'feedback') {
    readInput();
    if (req.body.feedback == 1) {
      saveInteraction();
    } else {
      forgetInteraction();
      findOutput(true);
      light();
    }
  } else if (req.body.type === 'color_choice') {
    blockAutoChange = true;
    output = {};
    output.red   = parseInt(req.body.color[0]);
    output.green = parseInt(req.body.color[1]);
    output.blue  = parseInt(req.body.color[2]);
    light();
  } else if (req.body.type === 'historyRequest') {
    console.log(brain);

    res.json(brain);
    return;
  } else if (req.body.type === 'color_learn') {
    blockAutoChange = true;
    output = {};
    output.red   = parseInt(req.body.color[0]);
    output.green = parseInt(req.body.color[1]);
    output.blue  = parseInt(req.body.color[2]);
    readInput();
    saveInteraction();
  } else if (req.body.type === 'request_current_ambiance') {
    res.json({'current_ambiance': currentAmbiance});
    return;
  } else {
    console.log("Unknown request received " + req.body);
  }
  res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
});

// ===========================================================================
// IADev Module

let brain = {};

let input = [currentAmbiance, 0, 0, 0];

let output = null;

Array.prototype.sample_with_probabilities = function (probabilities) {
  let total_sum = 0;
  for (let i = 0; i != probabilities.length; ++i) {
    total_sum += probabilities[i];
  }

  let rng = Math.random() * total_sum;
  for (let i = 0; i != probabilities.length; ++i) {
    if (rng < probabilities[i]) {
      return this[i];
    }

    rng -= probabilities[i];
  }

  return 0;
}

let compute_probabilities = function () {
  return [20, 10, 20, 10, 20];
};

let generate_candidate = function () {
  const POSSIBLE_VALUES = [0, 10, 20, 30, 40];

  probabilities = {
    red: compute_probabilities(),
    green: compute_probabilities(),
    blue: compute_probabilities()
  }

  candidate = {
    red: POSSIBLE_VALUES.sample_with_probabilities(probabilities.red),
    green: POSSIBLE_VALUES.sample_with_probabilities(probabilities.green),
    blue: POSSIBLE_VALUES.sample_with_probabilities(probabilities.blue)
  };

  let isValid = function (c) {
    return c.red != 0 || c.green != 0 || c.blue != 0;
  }

  return isValid(candidate) ? candidate : generate_candidate();
};


Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
}

function computeDistance(exploredAmbiance) {
  let dist = 0;
  for (let i = 0; i != 4; ++i) {
    if (exploredAmbiance[i] != input[i]) {
      dist += 1;
    }
  }
  return dist;
}

function normalize(color) {
  let normalize_color = function (color_value) {
    if (color_value < 10) {
      return 0;
    } else if (color_value < 30) {
      return 20;
    } else {
      return 40;
    }
  };

  return {
    red: normalize_color(color.red),
    green: normalize_color(color.green),
    blue: normalize_color(color.blue)
  };
}

function find_new_candidate() {
  let distance = 999;
  let nearAmbiances = [];

  for (let knownAmbiance in brain) {
    let localDistance = computeDistance(knownAmbiance);

    if (localDistance < distance) {
      nearAmbiances = [];
      distance = localDistance;
    }

    if (localDistance == distance) {
      nearAmbiances.push(knownAmbiance);
    }
  }

  if (nearAmbiances.length == 0) {
    return generate_candidate();
  } else {
    generated_color = { red: 0, green: 0, blue: 0 };

    for (let nearAmbiance of nearAmbiances) {
      generated_color.red += brain[nearAmbiance].red;
      generated_color.green += brain[nearAmbiance].green;
      generated_color.blue += brain[nearAmbiance].blue;
    }

    generated_color.red /= nearAmbiances.length;
    generated_color.green /= nearAmbiances.length;
    generated_color.blue /= nearAmbiances.length;

    return normalize(generated_color);
  }
}


function findOutput(forceNewCandidate) {
  if (brain[input]) {
    output = brain[input];
  } else {
    if (forceNewCandidate) {
      output = generate_candidate();
    } else {
      output = find_new_candidate();
    }
  }
}

function saveInteraction() {
  brain[input] = output;
  printSensorState();
  console.log("Saved Interaction " + input + " = " + output);
}

function forgetInteraction() {
  if (brain[input]) {
    delete brain[input];
  }
}
