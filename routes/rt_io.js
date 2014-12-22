var express = require('express');
var router = express.Router();
var AppConfig = require("../AppConfig");


var net = require('net');

router.get("/raw", function (req, res) {
  console.log(req.query.mood);
  switch (req.query.mood) {
    case '0':
      netio_send("channel 2 0");
      netio_send("channel 3 0");
      netio_send("channel 4 0");
      break;
    case '1':
      netio_send("channel 2 255");
      netio_send("channel 3 50");
      netio_send("channel 4 200");
      break;
  }
  res.send({ err: "" });
});

function netio_send(cmd) {
  var client = new net.Socket();
  client.on('data', function(data) {
	  console.log('Received: ' + data);
	  client.destroy(); // kill client after server's response
  });

  client.on('error', function (e) {
    console.log("Error: " + e.code);
    client.destroy();
  });
  client.setTimeout(1000);
  client.on('timeout', function () {
    console.log("TimeOut");
    client.destroy();
  });

  client.on('close', function() {
	  console.log('Connection closed');
  });

	client.connect(2701, '192.168.0.70', function() {
		console.log('--Connected');
		client.write(cmd+"\n");
	});
}



//--------------- Device ---------------------------------
router.get('/device', function (req, res) {
  res.render('iodevice',{ AppConfig: AppConfig });
});

router.get('/device/get', function (req, res) {
  res.send({
      err:"", 
      rows: [
        {
          hostname: "Horst1",
          ip: "192.168.0.71"
        }
       ] 
      });
});


module.exports = router;
