var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var AppConfig = require("../AppConfig");
var DBCon = require('../lib/dbconnection');
var multer = require('multer');
var fs = require('fs');
var moment = require('moment');
require('../lib/functions');


router.get('/', function (req, res) {
  res.render('DokuSys');
});

function send(res,data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('charset', 'utf-8');
  res.send(data);
}

router.get('/getList', function (req, res) {
  DBCon.query(req.session, "select id, parent, topic,keywords from "+AppConfig.tables.dokusys_topics+" where id > 0 order by parent,topic",
    function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('charset', 'utf-8');
      res.send(data);
    });
});

function getParents(sess,parentId,parents,cb) {
  if (parentId === 0) {
    cb(parents);
    return;
  }
  DBCon.query(sess, "select id,topic,parent from " + AppConfig.tables.dokusys_topics + " where id=" + parentId, function (pdata) {
    parents.push({ id: pdata.rows[0].id, topic: pdata.rows[0].topic });
    getParents(sess, pdata.rows[0].parent, parents,cb);
  });
  
}

router.get('/file', function (req, res) {
  DBCon.query(req.session, "select filename from " + AppConfig.tables.dokusys_uploads + " where id=" + req.query.id,
    function (data) {
      if (data.err) {
        send(res, data);
        return;
      }
      console.log(data.rows[0].filename);
      res.sendFile(data.rows[0].filename, { root: AppConfig.path.dokusys_files });
    });
});

router.get('/rmfile', function (req, res) {
  DBCon.query(req.session, "select filename from " + AppConfig.tables.dokusys_uploads + " where id=" + req.query.id,
    function (data) {
      if (data.err) {
        send(res, data);
        return;
      }
      console.log(data.rows[0].filename);
      res.sendFile(data.rows[0].filename, { root: AppConfig.path.dokusys_files });
    });
});

router.get('/get', function (req, res) {
  DBCon.query(req.session, "select id, parent, topic, keywords, topictext, dokustatus, user, time from " + AppConfig.tables.dokusys_topics + " where id=" + req.query.id,
    function (data) {
      if (data.err) {
        send(res, data);
        return;
      }
      if (data.rows.length) {
        // Links:
        var ltab = AppConfig.tables.dokusys_links;
        var ftab = AppConfig.tables.dokusys_uploads;
        var qry = "select " + ltab + ".id, bez, link, target, typ, sort, " + ftab + ".version, filename, "
              + ftab + ".id as file_id, "+ ftab + ".user as fileuser, " + ftab + ".time as filetimestamp "
              + " from " + ltab
              + " left join " + ftab + " on " + ltab + ".id = " + ftab + ".link_id where topic_id=" + req.query.id
              + " order by sort, link_id, " + ftab + ".version desc";
        DBCon.query(req.session, qry,
          function (lnkdata) {
            for (var i = 0; i < lnkdata.rows.length; i++) {
              if (lnkdata.rows[i].typ === "FILE") {
                var ftime = moment.unix(lnkdata.rows[i].filetimestamp);
                lnkdata.rows[i].filetime = ftime.format("DD.MM.YYYY HH:mm:ss");
              }
            }
            data.rows[0].links = lnkdata.rows;

            //parents:
            getParents(req.session, data.rows[0].parent, [], function (parents) {
              data.rows[0].parents = parents;
              send(res, data);
            });
          });
      } else {
        send(res, data);
      }
    });
});

router.post('/set', function (req, res) {
  var post = req.body;
  var qry = mysql.format(" set ?", [{
    parent: post.parent,
    topic: post.topic,
    keywords: post.keywords,
    topictext: post.topictext
  }]);
  if (post.id < 0) {
    qry = "insert into " + AppConfig.tables.dokusys_topics + qry;
    DBCon.query(req.session, qry, function (data) {
      //console.log(data.rows)
      send(res, { err: "", id: data.rows.insertId, result: data.rows });
    });
  } else {
    qry = "update " + AppConfig.tables.dokusys_topics + qry+ " where id=" + post.id;
    DBCon.query(req.session, qry, function (data) {
      //console.log(data.rows)
      send(res, { err: "", id: post.id, result: data.rows });
    });
  }
});

router.post('/upload', multer({ dest: "./upload" }), function (req, res) {
  function insertFile() {
    var qry = mysql.format(" set ?", [{
      link_id: req.body.link_id,
      filename: filename,
      version: req.body.version,
      user: req.session.user,
      time: ts
    }]);
    qry = "insert into " + AppConfig.tables.dokusys_uploads + qry;
    console.log(qry);
    DBCon.query(req.session, qry, function () {
      send(res, { err: "" });
    });
  }

  //req.setBodyEncoding("binary");
  var ts = new Date() / 1000 | 0;
  var filename = "T" + req.body.topic_id.lpad(0, 8) + "_" + ts + "." + req.files.anhang.extension.replace(/\\/, "\\\\");
  //console.log(filename);

  fs.rename(req.files.anhang.path, AppConfig.path.dokusys_files + filename, function (err) {
    if (err) {
      console.log(err);
      send(res, { err: err });
      return;
    } else {
      if (req.body.link_id < 0) {  // Neuer Link
        var qry = mysql.format(" set ?", [{
          topic_id: req.body.topic_id,
          bez: req.body.titel,
          version: req.body.version,
          typ: 'FILE',
          user: req.session.user,
          time: ts
        }]);
        qry = "insert into " + AppConfig.tables.dokusys_links + qry;
        console.log(qry);
        DBCon.query(req.session, qry, function (data) {
          req.body.link_id = data.rows.insertId;
          insertFile();
        });
      } else {
        insertFile();
      }
    }
  });
});




module.exports = router;
