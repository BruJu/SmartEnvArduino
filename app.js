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
let lightOff = undefined;
let currentAmbiance = "Blood";

function changeInputRange(value) {
  return Math.floor(value * 2);
}

sensorColor = {}

board.on("ready", function () {
  let leds = {};
  let sensor = {};

  for (let color in PINS) {
    let opt = { pin: PINS[color][1], freq: 250 };
    console.log(opt);
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

        if (brain[potentialInput]) {
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
    leds['RED'].brightness(output.red);
    leds['GREEN'].brightness(output.green);
    leds['BLUE'].brightness(output.blue);
  }

  lightOff = function () {
    leds['RED'].brightness(0);
    leds['GREEN'].brightness(0);
    leds['BLUE'].brightness(0);
  }

  readInput = function () {
    input = [
      currentAmbiance,
      changeInputRange(sensor.RED.level),
      changeInputRange(sensor.GREEN.level),
      changeInputRange(sensor.BLUE.level)
    ]
  }

  changeAmbiance = function (ambiance) {
    currentAmbiance = ambiance;
  }
});



// ============================================================================
// ==== Routing : Requests


app.post('/request', function (req, res) {
  console.log(req.body);
  if (req.body.type === 'ambiance') {
    if (changeAmbiance !== undefined) {
      changeAmbiance(req.body.ambiance);
    }
  } else if (req.body.type === 'on') {
    if (readInput !== undefined && light !== undefined) {
      readInput();
      findOutput();
      light();
    }
  } else if (req.body.type === 'feedback') {
    if (req.body.feedback == 1) {
      saveInteraction();
    } else {
      forgetInteraction();
      findOutput(true);
      light();
    }
  } else {
    console.log(brain);
    res.json(brain);
    return;
  }
  res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
})

// ===========================================================================
// IADev Module

let brain = {};

let input = [currentAmbiance, 0, 0, 0];

let output = null;

let generate_candidate = function () {
  const POSSIBLE_VALUES = [0, 20, 40]

  candidate = {
    red: POSSIBLE_VALUES.sample(),
    green: POSSIBLE_VALUES.sample(),
    blue: POSSIBLE_VALUES.sample()
  };

  let isValid = function (c) {
    return c.red != 0 || c.green != 0 || c.blue != 0;
  }

  return isValid(candidate) ? candidate : generate_candidate();
}


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
}

function forgetInteraction() {
  if (brain[input]) {
    delete brain[input];
  }
}