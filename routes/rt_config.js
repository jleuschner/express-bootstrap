var express = require('express');
var router = express.Router();
var AppConfig = require("../AppConfig");
var DBCon = require('../lib/dbconnection');


router.get('/', function (req, res) {
  res.render('config');
});

router.get('/getList', function (req, res) {
  DBCon.query(req.session, "select id, parent, topic,keywords from "+AppConfig.tables.dokusys_topics+" order by parent,topic",
    function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('charset', 'utf-8');
      res.send(data);
    });
});

module.exports = router;
