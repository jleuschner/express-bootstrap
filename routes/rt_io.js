var express = require('express');
var router = express.Router();
var AppConfig = require("../AppConfig");
var DBCon = require('../lib/dbconnection');



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
router.get('/devices/html', function (req, res) {
  res.render('iodevice',{ AppConfig: AppConfig });
});

function getDevices(req,res,id) {
  var qry = "select * from " + AppConfig.io.tbl_iodevices;
  if (id) {
    qry += " where id=" + id;
  } else {
    qry += " order by id";
  }
  DBCon.query(req.session, qry,
    function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('charset', 'utf-8');
      res.json(data);
    });
}

router.route("/devices")
    .get(function (req, res) {
      getDevices(req,res);
    });
router.route("/devices/:deviceID")
    .get(function (req, res) {
      getDevices(req,res,req.params.deviceID);
    });

router.post('/device/set', function (req, res) {
  var post = req.body;
  res.send({
      err: {code:"DUBHostname", text: "Hostname " + post.hostname + " existiert bereits"}
      });
});


module.exports = router;
