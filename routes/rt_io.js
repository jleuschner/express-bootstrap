var express = require('express');
var router = express.Router();
var AppConfig = require("../AppConfig");
var mysql = require('mysql');
var DBCon = require('../lib/dbconnection');



var net = require('net');

router.get("/raw", function (req, res) {
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
  client.on('data', function() {
	  client.destroy(); // kill client after server's response
  });

  client.on('error', function () {
    client.destroy();
  });
  client.setTimeout(1000);
  client.on('timeout', function () {
    client.destroy();
  });

  client.on('close', function() {
	  //console.log('Connection closed');
  });

	client.connect(2701, '192.168.0.70', function() {
		client.write(cmd+"\n");
	});
}



//--------------- IoDevices ---------------------------------
router.get('/devices/html', function (req, res) {
  res.render('io/devices',{ AppConfig: AppConfig });
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

function setDevice(req,res,id) {
  var post = req.body;
  var qry = mysql.format(" set ?", [{
    hostname: post.hostname,
    ip: post.ip,
    remark: post.remark
  }]);
  if (id < 1) {
    qry = "insert into " + AppConfig.io.tbl_iodevices + qry;
    DBCon.query(req.session, qry, function (data) {
      res.json({ err: "", id: data.rows.insertId, result: data.rows });
    });
  } else {
    qry = "update " + AppConfig.io.tbl_iodevices + qry+ " where id=" + id;
    DBCon.query(req.session, qry, function (data) {
      res.json({ err: "", id: id, result: data.rows });
    });
  }
  
}

router.route("/devices")
    .get(function (req, res) {
      getDevices(req,res);
    })
    .post(function(req,res){
      setDevice(req,res,0);
    });
router.route("/devices/:deviceID")
    .get(function (req, res) {
      getDevices(req,res,req.params.deviceID);
    })
    .put(function (req, res) {
      setDevice(req,res,req.params.deviceID);
    })
    .delete(function(req,res){
      var qry = "delete from " + AppConfig.io.tbl_iodevices + " where id="+req.params.deviceID;
      DBCon.query(req.session, qry,
        function () {
          res.json({err:""});
        });
    });


//--------------- IoTypes ---------------------------------
router.get('/types/html', function (req, res) {
  res.render('io/types',{ AppConfig: AppConfig });
});



module.exports = router;
