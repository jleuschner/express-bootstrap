var express = require('express');
var router = express.Router();
//var AppConfig = require("../AppConfig");

router.get('/', function (req, res) {
  console.log(req.session.user);
  res.render('DokuSys');
});


module.exports = router;
