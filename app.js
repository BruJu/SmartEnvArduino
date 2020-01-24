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
let currentAmbiance = null;

function changeInputRange(value) {
  return Math.floor(value * 2);
}

board.on("ready", function () {
  let leds = {};
  let sensor = {};

  for (let color in PINS) {
    sensor[color] = new five.Light(PINS[color][1]);
    leds[color] = new five.Led(PINS[color][0]);
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
    input = {
      ambiance: currentAmbiance,
      red: changeInputRange(sensor.RED.level),
      green: changeInputRange(sensor.GREEN.level),
      blue: changeInputRange(sensor.BLUE.level)
    }
  }

  changeAmbiance = function (ambiance) {
    currentAmbiance = ambiance;
  }
});



// ============================================================================
// ==== Routing : Requests


app.post('/request', function (req, res) {
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
    if (req.body.feedback === 1) {
      saveInteraction();
    } else {

      if (brain[hashInput(input)]) {
        brain.delete(hashInput(input));
      }

      findOutput();
      light();
    }
  }
  res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
})

// ===========================================================================
// IADev Module

let brain = {};
let input = {
  ambiance: null,
  red: null,
  green: null,
  blue: null
};
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

function hashInput(input) {
  return String(input.ambiance) + String(input.red) + String(input.green) + String(input.blue);
}

function findOutput() {
  let hash = hashInput(input);
  if (brain[hash]) {
    output = brain[hash];
  } else {
    output = generate_candidate();
  }
}

function saveInteraction() {
  let hash = hashInput(input);
  brain[hash] = output;
}
