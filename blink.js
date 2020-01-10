let five = require("johnny-five");

let board = new five.Board();


board.on("ready", function() {
  let led = new five.Led(13);
  led.blink(1500);
});

