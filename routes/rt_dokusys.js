var express = require('express');
var router = express.Router();
//var AppConfig = require("../AppConfig");

router.get('/', function (req, res) {
  res.render('DokuSys');
});


module.exports = router;
