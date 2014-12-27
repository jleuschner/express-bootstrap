var express = require('express');
var router = express.Router();
var AppConfig = require("../AppConfig");
var mysql = require('mysql');
var DBCon = require('../lib/dbconnection');

//var table = AppConfig.....;
var table="template_cruds";
/*
CREATE TABLE `template_cruds` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `crudtitle` varchar(50) NOT NULL,
  `crudtext` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
);
*/
//--------------- CRUDs ---------------------------------
router.get('/cruds/html', function (req, res) {
  res.render('templates/cruds',{ AppConfig: AppConfig });
});

function objGet(req,res,id) {
  var qry = "select * from " + table;
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

function objSet(req,res,id) {
  var post = req.body;
  var qry = mysql.format(" set ?", [{
    crudtitle: post.crudtitle,
    crudtext: post.crudtext
  }]);
  if (id < 1) {
    qry = "insert into " + table + qry;
    DBCon.query(req.session, qry, function (data) {
      res.json({ err: "", id: data.rows.insertId, result: data.rows });
    });
  } else {
    qry = "update " + table + qry+ " where id=" + id;
    DBCon.query(req.session, qry, function (data) {
      res.json({ err: "", id: id, result: data.rows });
    });
  }
}

router.route("/cruds")
    .get(function (req, res) {
      objGet(req,res);
    })
    .post(function(req,res){
      objSet(req,res,0);
    });
router.route("/cruds/:id")
    .get(function (req, res) {
      objGet(req,res,req.params.id);
    })
    .put(function (req, res) {
      objSet(req,res,req.params.id);
    })
    .delete(function(req,res){
      var qry = "delete from " + table + " where id="+req.params.id;
      DBCon.query(req.session, qry,
        function () {
          res.json({err:""});
        });
    });

module.exports = router;
