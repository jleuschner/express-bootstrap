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
var objDevice = function(data) {
  var _this=this;
  this.data = data;
  this.getIos = function(cb) {
    var qry = "select * from "+ AppConfig.io.tbl_iodefinitions +" where devices_id="+data.id;
    DBCon.querySys(qry, function(defData){
      _this.data.ios=defData.rows;
      if (cb) {cb()};
    });
  };

  this.getData = function(){
    var _this=this;
    this.getIos(function(){
      console.log(JSON.stringify(_this.data))
      return(_this.data);
    });
  }
}

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
      var deviceList=[];
      for (var k=0;k<data.rows.length;k++) {
        var device =new objDevice(data.rows[k]);
        console.log(device.getData());
        deviceList.push(device.getData());
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('charset', 'utf-8');
      console.log("OUT: "+JSON.stringify(deviceList))

      res.json(deviceList);
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


//--------------- IoDefinitions ---------------------------------

function defGet(req,res,id) {
  var qry = "select * from " + AppConfig.io.tbl_iodefinitions;
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

function defSet(req,res,id) {
  var post = req.body;
  var qry = mysql.format(" set ?", [{
    name: post.name,
    devices_id: post.devices_id,
    types_id: post.types_id,
    param1: post.param1,
    param2: post.param2,
    param3: post.param3,
    param4: post.param4
  }]);
  if (id < 1) {
    qry = "insert into " + AppConfig.io.tbl_iodefinitions + qry;
    DBCon.query(req.session, qry, function (data) {
      res.json({ err: "", id: data.rows.insertId, result: data.rows });
    });
  } else {
    qry = "update " + AppConfig.io.tbl_iodefinitions + qry+ " where id=" + id;
    DBCon.query(req.session, qry, function (data) {
      res.json({ err: "", id: id, result: data.rows });
    });
  }
  
}

router.route("/definitions")
    .get(function (req, res) {
      defGet(req,res);
    })
    .post(function(req,res){
      defSet(req,res,0);
    });
router.route("/definitions/:ID")
    .get(function (req, res) {
      defGet(req,res,req.params.ID);
    })
    .put(function (req, res) {
      defSet(req,res,req.params.ID);
    })
    .delete(function(req,res){
      var qry = "delete from " + AppConfig.io.tbl_iodefinitions + " where id="+req.params.ID;
      DBCon.query(req.session, qry,
        function () {
          res.json({err:""});
        });
    });


//--------------- IoTypes ---------------------------------
router.get('/types/html', function (req, res) {
  res.render('io/types',{ AppConfig: AppConfig });
});

function typesGet(req,res,id) {
  //var qry = "select * from " + AppConfig.io.tbl_iotypes;
  var qry = "select "+AppConfig.io.tbl_iotypes+".id, "+AppConfig.io.tbl_iotypes+".name, remark, classes_id, protocols_id, param1, param2, param3, param4, " 
    + AppConfig.io.tbl_ioclasses + ".name as class, "
    + AppConfig.io.tbl_ioprotocols + ".name as protocol "
    + "from " 
    + AppConfig.io.tbl_iotypes + " left join "
    + AppConfig.io.tbl_ioclasses + " on " + AppConfig.io.tbl_iotypes + ".classes_id="+ AppConfig.io.tbl_ioclasses+".id left join "
    + AppConfig.io.tbl_ioprotocols + " on " + AppConfig.io.tbl_iotypes + ".protocols_id="+ AppConfig.io.tbl_ioprotocols+".id " 
    ;
  if (id) {
    qry += " where "+AppConfig.io.tbl_iotypes+".id=" + id;
  } else {
    qry += " order by "+AppConfig.io.tbl_iotypes+".id";
  }
  DBCon.query(req.session, qry,
    function (data) {
      for (var j=0; j<data.rows.length;j++){
        var params=[];
        for (var i=1;i<5;i++){
          if (eval('data.rows[j].param'+i)) { params.push(eval('data.rows[j].param'+i)); }
        }
        data.rows[j].params=params;
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('charset', 'utf-8');
      res.json({ err: data.err, rows: data.rows });
    });
}

function typesSet(req,res,id) {
  var post = req.body;
  var qry = mysql.format(" set ?", [{
    name: post.name,
    remark: post.remark,
    classes_id: post.classes_id,
    protocols_id: post.protocols_id,
    param1: post.param1,
    param2: post.param2,
    param3: post.param3,
    param4: post.param4
  }]);
  console.log(qry);
  if (id < 1) {
    qry = "insert into " + AppConfig.io.tbl_iotypes + qry;
    DBCon.query(req.session, qry, function (data) {
      res.json({ err: "", id: data.rows.insertId, result: data.rows });
    });
  } else {
    qry = "update " + AppConfig.io.tbl_iotypes + qry+ " where id=" + id;
    DBCon.query(req.session, qry, function (data) {
      res.json({ err: "", id: id, result: data.rows });
    });
  }
  
}

router.route("/types")
    .get(function (req, res) {
      typesGet(req,res);
    })
    .post(function(req,res){
      typesSet(req,res,0);
    });
router.route("/types/:ID")
    .get(function (req, res) {
      typesGet(req,res,req.params.ID);
    })
    .put(function (req, res) {
      typesSet(req,res,req.params.ID);
    })
    .delete(function(req,res){
      var qry = "delete from " + AppConfig.io.tbl_iotypes + " where id="+req.params.ID;
      DBCon.query(req.session, qry,
        function () {
          res.json({err:""});
        });
    });

//--------------- IoClasses ---------------------------------
router.route("/classes")
  .get(function (req, res) {
    var qry = "select * from " + AppConfig.io.tbl_ioclasses + " order by id";
    DBCon.querySys(qry,
      function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('charset', 'utf-8');
        res.json({ err: data.err, rows: data.rows });
      });
  });

//--------------- IoProtocols ---------------------------------
router.route("/protocols")
  .get(function (req, res) {
    var qry = "select * from " + AppConfig.io.tbl_ioprotocols + " order by id";
    DBCon.querySys(qry,
      function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('charset', 'utf-8');
        res.json({ err: data.err, rows: data.rows });
      });
  });


module.exports = router;
