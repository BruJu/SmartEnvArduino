let five = require("johnny-five");

let board = new five.Board();


board.on("reader", function() {
  let led = new file.Led(13);
  led.blink(666);
});

