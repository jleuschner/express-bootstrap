var express = require('express');
var router = express.Router();

var AppConfig = require("../AppConfig");
var DBCon = require('../lib/dbconnection');


/* GET home page. */
router.get('/', function(req, res) {
  //res.render('index', { title: 'Bootstrap Template' });
  res.render('index', { AppConfig: AppConfig });
});

router.post('/check', function (req, res) {
  DBCon.connect(req.session.user, req.session.passwd, function (data) {
    //console.log(data);
    if (data.err) {
      delete req.session.user;
      delete req.session.passwd;
    } 
    res.send( {err: data.err, user: req.session.user } );
  });
});

router.post('/login', function (req, res) {
  var post = req.body;
  DBCon.connect(post.user, post.passwd, function (data) {
    //console.log(data);
    if (data.err) {
      delete req.session.user;
      delete req.session.passwd;
    } else {
      req.session.user = post.user;
      req.session.passwd = post.passwd;
      //console.log(req.session);
    }
    res.send( {err: data.err} );
  });
});

router.get('/logout', function (req, res) {
  //console.log(req.session.user + " / " + req.session.passwd);
  delete req.session.user;
  delete req.session.passwd;
  res.send({ err: "" });
});

module.exports = router;
