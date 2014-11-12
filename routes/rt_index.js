var express = require('express');
var router = express.Router();

var AppConfig= require("../AppConfig")


/* GET home page. */
router.get('/', function(req, res) {
  //res.render('index', { title: 'Bootstrap Template' });
  res.render('index', { title: AppConfig.title });
});

module.exports = router;
