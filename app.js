// ============
// IMPORTS

// Express
const express = require('express')
const app = express()

// Body Parser
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({ extended: true }));

// ============================================================================
// ==== Routing : Website

app.get('/', function (req, res) {
  res.sendFile('interface.html', {
    root: '.'
  })
})

app.use('/', express.static('public'));

app.listen(3000, function () {
  console.log('Listening on port 3000 !')
})


// ============================================================================
// ==== Arduino Board

let five = require("johnny-five");
let board = new five.Board();

/**
 * PINS ID on the board with for each color the led number and the sensor number
 */
const PINS = {
  RED: [10, 'A1'], GREEN: [9, 'A2'], BLUE: [11, 'A0']
};

// == Model
let currentAmbiance = "Normale";
let input = [currentAmbiance, 0, 0, 0]; // Current ambiance x detected colors 
let output = null;                      // Colors to display on the led

let dispostive_is_active = false;
// When the user choose manually the color, we block the adaptation of the led
let blockAutoChange = false;

// == Functions to affect toe model
// = Model
let readInput = undefined;
let changeAmbiance = undefined;
let printSensorState = undefined;
// = View
let light = undefined;

/**
 * Set the sensor received light at three level : 0, 1 and 2
 * @param {*} value 
 */
function changeInputRange(value) {
  return Math.floor(value * 2);
}


board.on("ready", function () {
  let leds = {};
  let sensor = {};
  let sensorColor = {}

  // Associate pin with light sensors and leds
  for (let color in PINS) {
    let opt = { pin: PINS[color][1], freq: 250 };
    sensor[color] = new five.Light(opt);
    leds[color] = new five.Led(PINS[color][0]);

    sensor[color].on("change", function () {
      sensorColor[color] = this.level;

      potentialInput = [
        currentAmbiance,
        changeInputRange(sensor.RED.level),
        changeInputRange(sensor.GREEN.level),
        changeInputRange(sensor.BLUE.level)
      ];

      // Adapt the LED color with the new input
      if (!blockAutoChange && brain[potentialInput]) {
        readInput();
        findOutput();
        light();
      }
    });
  }

  // == METHODS TO INTERACT WITH THE MODEL AND THE VIEW

  // = MODEL

  /**
   * Updates the detected level of sensors
   */
  readInput = function () {
    input = [
      currentAmbiance,
      changeInputRange(sensor.RED.level),
      changeInputRange(sensor.GREEN.level),
      changeInputRange(sensor.BLUE.level)
    ]
    blockAutoChange = false;
  }

  /**
   * Changes the currently selected ambiance
   */
  changeAmbiance = function (ambiance) {
    currentAmbiance = ambiance;
  }

  /**
   * Prints the currently detected level of the sensors
   */
  printSensorState = function() {
    console.log("Sensor : Red=" + sensor.RED.level
                    + " Green=" + sensor.GREEN.level
                    +  " Blue=" + sensor.BLUE.level);
  }
  
  // = VIEW

  /**
   * Change the LED color using the required output
   */
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
});


// ============================================================================
// ==== Routing : Requests

// Manages every request received from the web interface
app.post('/request', function (req, res) {
  // console.log(req.body);
  if (req.body.type === 'ambiance') {
    /** Change the current ambiance */
    if (changeAmbiance !== undefined) {
      changeAmbiance(req.body.ambiance);
    }
  } else if (req.body.type === 'on') {
    /** Enables the device and choose the color adapted to the ambiance */
    if (readInput !== undefined && light !== undefined) {
      dispostive_is_active = true;
      readInput();
      findOutput();
      light();
    }
  } else if (req.body.type === 'off') {
    /** Turns off the device */
    dispostive_is_active = false;
    light();
  } else if (req.body.type === 'feedback') {
    /** Register the result of the current interaction */
    readInput();
    if (req.body.feedback == 1) {
      saveInteraction();
    } else {
      forgetInteraction();
      findOutput(true);
      light();
    }
  } else if (req.body.type === 'color_choice') {
    /** Changes the color according to the user's wish */
    blockAutoChange = true;
    output = {};
    output.red   = parseInt(req.body.color[0]);
    output.green = parseInt(req.body.color[1]);
    output.blue  = parseInt(req.body.color[2]);
    light();
  } else if (req.body.type === 'color_learn') {
    /**
     * Learn the interaction consisting of the currently detected color and the
     * given color 
     */
    blockAutoChange = true;
    output = {};
    output.red   = parseInt(req.body.color[0]);
    output.green = parseInt(req.body.color[1]);
    output.blue  = parseInt(req.body.color[2]);
    readInput();
    saveInteraction();
  } else if (req.body.type === 'historyRequest') {
    /** Returns a JSON with every learned interaction */
    console.log(brain);
    res.json(brain);
    return;
  } else if (req.body.type === 'request_current_ambiance') {
    /** Returns the name of the current ambiance */
    res.json({'current_ambiance': currentAmbiance});
    return;
  } else {
    console.log("Unknown request received " + req.body);
  }
  // If the response is not a JSON, we manually send a 200 response to end the
  // connexion
  res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
});


// ===========================================================================
// ==== IADev Module : Learning and predicting the expected light color

let brain = {};

/**
 * Returns a random element from the array using the passed probabilities
 * We suppose len(array) == len(probabilities) and sum(probabilities) = 1
 */
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

/**
 * Generates a random color to display
 */
let generate_candidate = function () {
  const POSSIBLE_VALUES = [0, 10, 20, 30, 40];
  const PROBABILITIES = [20, 10, 20, 10, 20];

  candidate = {
    red: POSSIBLE_VALUES.sample_with_probabilities(PROBABILITIES),
    green: POSSIBLE_VALUES.sample_with_probabilities(PROBABILITIES),
    blue: POSSIBLE_VALUES.sample_with_probabilities(PROBABILITIES)
  };

  let isValid = function (c) {
    return c.red != 0 || c.green != 0 || c.blue != 0;
  }

  return isValid(candidate) ? candidate : generate_candidate();
};

/**
 * Computes the distance between the current input (ambiance and current
 * sensor values) and the explored ambiance (which has the same structure)
 * @param {*} exploredAmbiance 
 */
function computeDistance(exploredAmbiance) {
  let dist = 0;
  for (let i = 0; i != 4; ++i) {
    if (exploredAmbiance[i] != input[i]) {
      dist += 1;
    }
  }
  return dist;
}

/**
 * Normalize the given color to round it to 0, 20 or 40.
 * @param {*} color 
 */
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

/**
 * Computes a color to display that the user should appreciate with respect
 * to the already learned near ambiances to the current ambiance.
 */
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

/**
 * Updates output to the colors to display on the LED that the user should
 * appreciate.
 * @param {*} forceNewCandidate If true, force a random candidate instead of a
 *                              computed one
 */
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

/**
 * Saves the current interaction (current ambiance and detected lights with the
 * current output on the LED) as a favorable one
 */
function saveInteraction() {
  brain[input] = output;
  printSensorState();
  console.log("Saved Interaction " + input + " = " + output);
}

/**
 * Forget the preference registered for the current ambiance and detected
 * lights
 */
function forgetInteraction() {
  if (brain[input]) {
    delete brain[input];
  }
}
