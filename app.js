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

const LED_PIN_IDS = {
  RED: 10,
  GREEN: 9,
  BLUE: 11
};
const LIGHTSENSOR_PINS = {
  RED: 'A1',
  GREEN: 'A2',
  BLUE: 'A0'
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

  for (let lightId in LIGHTSENSOR_PINS) {
    sensor[lightId] = new five.Light(LIGHTSENSOR_PINS[lightId]);
  }

  for (let ledId in LED_PIN_IDS) {
    leds[ledId] = new five.Led(LED_PIN_IDS[ledId]);
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
      blue: changeInputRange(sensor.BLUE.level),
    }
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
    if (req.body.feedback === 1) {
      saveInteraction();
    }
    if (lightOff !== undefined) {
      lightOff();
    }
  }
  /*if (req.body.type == 'lightOn') {
    if (changeAmbiance !== undefined) {
      changeAmbiance(req.body.ambiance);
    }
  }*/
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
let candidates = [{
    red: 0,
    green: 0,
    blue: 0
  },
  {
    red: 0,
    green: 0,
    blue: 127
  },
  {
    red: 0,
    green: 0,
    blue: 255
  },
  {
    red: 0,
    green: 127,
    blue: 0
  },
  {
    red: 0,
    green: 127,
    blue: 127
  },
  {
    red: 0,
    green: 127,
    blue: 255
  },
  {
    red: 0,
    green: 255,
    blue: 0
  },
  {
    red: 0,
    green: 255,
    blue: 127
  },
  {
    red: 0,
    green: 255,
    blue: 255
  },
  {
    red: 255,
    green: 0,
    blue: 0
  },
  {
    red: 255,
    green: 0,
    blue: 127
  },
  {
    red: 255,
    green: 0,
    blue: 255
  },
  {
    red: 255,
    green: 127,
    blue: 0
  },
  {
    red: 255,
    green: 127,
    blue: 127
  },
  {
    red: 255,
    green: 127,
    blue: 255
  },
  {
    red: 255,
    green: 255,
    blue: 0
  },
  {
    red: 255,
    green: 255,
    blue: 127
  },
  {
    red: 255,
    green: 255,
    blue: 255
  },
  {
    red: 127,
    green: 0,
    blue: 0
  },
  {
    red: 127,
    green: 0,
    blue: 127
  },
  {
    red: 127,
    green: 0,
    blue: 255
  },
  {
    red: 127,
    green: 127,
    blue: 0
  },
  {
    red: 127,
    green: 127,
    blue: 127
  },
  {
    red: 127,
    green: 127,
    blue: 255
  },
  {
    red: 127,
    green: 255,
    blue: 0
  },
  {
    red: 127,
    green: 255,
    blue: 127
  },
  {
    red: 127,
    green: 255,
    blue: 255
  }
];

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
    output = candidates.sample();
  }
}

function saveInteraction() {
  let hash = hashInput(input);
  brain[hash] = output;
}
