var express = require('express');
var router = express.Router();

var AppConfig = require("../AppConfig");


/* GET home page. */
router.get('/', function(req, res) {
  //res.render('index', { title: 'Bootstrap Template' });
  res.render('index', { AppConfig: AppConfig });
});

router.post('/login', function (req, res) {
  var post = req.body;
  if (post.user === "jens") {
    req.session.user = post.user;
    res.send({ err: "OK" });
  } else {
    res.send({ err: "ERR" })
  }
});

module.exports = router;
