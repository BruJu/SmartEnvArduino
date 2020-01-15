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
let changeAmbiance = undefined;

board.on("ready", function() {
  let led = new five.Led(13);
  led.blink(1500);

  let leds = {};

  for (let ledId in LED_PIN_IDS) {
    leds[ledId] = { 'pin': new five.Led(LED_PIN_IDS[ledId]), 'hasToBeStopped': false };
  }


  function setColor(r, g, b) {
    leds['RED'].pin.brightness(r);
    leds['GREEN'].pin.brightness(g);
    leds['BLUE'].pin.brightness(b);
  }

  changeAmbiance = function(ambiance) {
    for (let ledID in LED_PIN_IDS) {
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
        function() {
          if (pair) {
            setColor(0, 0, 30);
            setTimeout(function() { setColor(10, 0, 0); }, 100);
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
    }
  };

  flashRedLed = function() {
    leds['RED'].brightness(30);
    setTimeout(function() { leds['RED'].brightness(0); }, 2000);
  };
});



// ============================================================================
// ==== Routing : Requests


app.post('/request', function (req, res) {  
  console.log(req.body);
  if (req.body.type == 'lightOn') {
    if (changeAmbiance !== undefined) {
      changeAmbiance(req.body.ambiance);
    }
  }
})


