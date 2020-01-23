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
  console.log('Example app listening on port 3000!')
})


// ============================================================================
// ==== Arduino Board

let five = require("johnny-five");

let board = new five.Board();

const LED_PIN_IDS = {
  GREEN: 9,
  RED: 10,
  BLUE: 11
};
const LIGHTSENSOR_PINS = {
  GREEN: null,
  RED: null,
  BLUE: null
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
  let lights = {};

  for (let lightId of LIGHTSENSOR_PINS) {
    lights[lightId] = new five.Light(LIGHTSENSOR_PINS[lightId]);
  }
  //let lightSensor = new five.Light(LIGHTSENSOR_PIN);

  for (let ledId in LED_PIN_IDS) {
    leds[ledId] = new five.Led(LED_PIN_IDS[ledId]);
    /*{
      'pin': new five.Led(LED_PIN_IDS[ledId]),
      'hasToBeStopped': false
    };*/
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
      red: changeInputRange(lights.RED.level),
      green: changeInputRange(lights.GREEN.level),
      blue: changeInputRange(lights.BLUE.level),
    }
  }

  /*function setColor(r, g, b) {
    leds['RED'].pin.brightness(r);
    leds['GREEN'].pin.brightness(g);
    leds['BLUE'].pin.brightness(b);
  }*/

  changeAmbiance = function (ambiance) {
    currentAmbiance = ambiance;
    /*for (let ledID in LED_PIN_IDS) {
      leds[ledID].pin.brightness(0);

      if (leds[ledID].hasToBeStopped) {
        leds[ledID].pin.stop();
        leds[ledID].hasToBeStopped = false;
      }
    }

    if (ambiance == 'Sea') {
      setColor(0, 20, 40);
    } else if (ambiance == 'Blood') {
      setColor(10, 0, 0);
      let pair = true;
      leds['RED'].pulse(1000,
        function () {
          if (pair) {
            setColor(0, 0, 30);
            setTimeout(function () {
              setColor(10, 0, 0);
            }, 100);
          }

          pair = !pair;
        }
      );
      leds['RED'].hasToBeStopped = true;

    } else if (ambiance == 'Wood') {
      setColor(0, 25, 0);
    } else if (ambiance == 'Horrible') {
      setColor(255, 0, 255);
    } else {
      console.log("Fail to match " + ambiance);
    }*/
  };

  /*flashRedLed = function () {
    leds['RED'].brightness(30);
    setTimeout(function () {
      leds['RED'].brightness(0);
    }, 2000);
  };

  lightSensor.on("change", function () {
    function normalize(val) {
      if (val < 0.35) {
        return -1;
      } else if (val > 0.75) {
        return 1;
      } else {
        return (val - 0.35) * 2;
      }
    }

    setColor(60 * (1 - normalize(this.level)), 0, 0);
  });*/
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
  return String(input.ambiance) + String(input.red) + String(input.green) + String(input.blue0);
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