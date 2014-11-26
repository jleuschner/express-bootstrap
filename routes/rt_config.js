var express = require('express');
var router = express.Router();
//var AppConfig = require("../AppConfig");
var DBCon = require('../lib/dbconnection');


router.get('/', function (req, res) {
  res.render('config');
});

router.get('/getList', function (req, res) {
  DBCon.query(req.session, "select id, hostname, ip from io_devices",
    function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('charset', 'utf-8');
      res.send(data);
    });
});

router.get('/get', function (req, res) {
  console.log(req.query);
  if (!req.query.id) {
    var data = { err: { code: "NOID"} };
    res.send(data);
    return;
  }
  DBCon.query(req.session, "select id, hostname, ip from io_devices where id=" + req.query.id,
    function (data) {
      console.log(data);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('charset', 'utf-8');
      res.send(data);
    });
});

module.exports = router;
