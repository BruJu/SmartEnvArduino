const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})
app.get('/interface', function (req, res) {
  res.sendFile('interface.html', {
      root:'.'
  })
})
app.post('/feedback', function (req, res) {
  res.sendFile('interface.html')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

let five = require("johnny-five");

let board = new five.Board();


board.on("ready", function() {
  let led = new five.Led(13);
  led.blink(1500);
});

