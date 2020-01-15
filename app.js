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
      root:'.'
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

const LED_PIN_IDS = { GREEN: 9, RED: 10, BLUE: 11 };

let flashRedLed = undefined;

board.on("ready", function() {
  let led = new five.Led(13);
  led.blink(1500);

  let leds = {};

  for (let ledId in LED_PIN_IDS) {
    leds[ledId] = new five.Led(LED_PIN_IDS[ledId]);
  }

  flashRedLed = function() {
    leds['RED'].brightness(30);
    setTimeout(function() { leds['RED'].brightness(0); }, 2000);
  };
});



// ============================================================================
// ==== Routing : Requests


app.post('/request', function (req, res) {  
  console.log(req.body);
  if (req.body.aaaa == 'chaton') {
    if (flashRedLed !== undefined) {    
      flashRedLed();
    }
  }
})


