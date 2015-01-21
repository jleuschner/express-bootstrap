var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var AppConfig = require("../AppConfig");
var DBCon = require('../lib/dbconnection');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
require('../lib/functions');


router.get('/', function (req, res) {
  res.render('index',{ AppConfig: AppConfig });
});

router.get('/html', function (req, res) {
  res.render('DokuSys',{ AppConfig: AppConfig });
});

function send(res,data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('charset', 'utf-8');
  res.send(data);
}

function getParents(sess,parentId,parents,cb) {
  if (parentId === 0) {
    cb(parents);
    return;
  }
  DBCon.query(sess, "select id,topic,parent from " + AppConfig.dokusys.tbl_topics + " where id=" + parentId, function (pdata) {
    parents.push({ id: pdata.rows[0].id, topic: pdata.rows[0].topic });
    getParents(sess, pdata.rows[0].parent, parents,cb);
  });
  
}


router.route("/topics")
  .get( function (req, res) {
    DBCon.query(req.session, "select id, parent, topic,keywords from "+AppConfig.dokusys.tbl_topics+" where id > 0 order by parent,topic",
      function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('charset', 'utf-8');
        res.send(data);
      });
  })
  .post( function (req, res) {
    var post = req.body;
    var qry = mysql.format(" set ?", [{
      parent: post.parent,
      topic: post.topic,
      keywords: post.keywords,
      topictext: post.topictext
    }]);
    qry = "insert into " + AppConfig.dokusys.tbl_topics + qry;
    DBCon.query(req.session, qry, function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('charset', 'utf-8');
      res.send({ err: "", id: data.rows.insertId, result: data.rows });
    });
  });


router.route("/topics/:ID")
  .get(function (req, res) {
    DBCon.query(req.session, "select id, parent, topic, keywords, topictext, dokustatus, user, time from " + AppConfig.dokusys.tbl_topics + " where id=" + req.params.ID,
      function (data) {
        if (data.err) {
          send(res, data);
          return;
        }
        if (data.rows.length) {
          // Links:
          var ltab = AppConfig.dokusys.tbl_links;
          var ftab = AppConfig.dokusys.tbl_uploads;
          var qry = "select " + ltab + ".id, bez, link, target, typ, sort, " + ftab + ".version, filename, "
                + ftab + ".id as file_id, "+ ftab + ".user as fileuser, " + ftab + ".time as filetimestamp "
                + " from " + ltab
                + " left join " + ftab + " on " + ltab + ".id = " + ftab + ".link_id where topic_id=" + req.params.ID
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
  })
  .put( function (req, res) {
    var post = req.body;
    var qry = mysql.format(" set ?", [{
      parent: post.parent,
      topic: post.topic,
      keywords: post.keywords,
      topictext: post.topictext
    }]);
    qry = "update " + AppConfig.dokusys.tbl_topics + qry+ " where id=" + req.params.ID;
    DBCon.query(req.session, qry, function (data) {
      if (data.err) {
        //console.log(data.err);
        send (res, {err: data.err});
        return;
      }
      send(res, { err: "", id: req.params.ID, result: data.rows });
    });
  });


  

//-----------------------------------------------------------
//    /files
//-----------------------------------------------------------
router.route("/files/:ID")
  .get(function (req, res) {
    DBCon.query(req.session, "select filename from " + AppConfig.dokusys.tbl_uploads + " where id=" + req.params.ID,
      function (data) {
        if (data.err) {
          send(res, data);
          return;
        }
        if (data.rows.length) {
          // console.log(data.rows[0].filename);
          res.sendFile(data.rows[0].filename, { root: AppConfig.dokusys.path });
        } else {
          res.writeHead(404, {"Content-Type": "text/plain"});
          res.write("404 Not Found\n");
          res.end();
          return;        }
      });
  })
  .delete(function (req, res) {
    DBCon.query(req.session, "select filename, link_id from " + AppConfig.dokusys.tbl_uploads + " where id=" + req.params.ID,
      function (fdata) {
        if (fdata.err) {
          send(res, fdata);
          return;
        }
        var link_id = fdata.rows[0].link_id;
        fs.unlinkSync(path.join(AppConfig.dokusys.path, fdata.rows[0].filename));
        DBCon.query(req.session, "delete from " + AppConfig.dokusys.tbl_uploads + " where id=" + req.params.ID,
          function () {
            DBCon.query(req.session, "select id, filename from " + AppConfig.dokusys.tbl_uploads + " where link_id=" + link_id,
              function (ffdata) {
                if (ffdata.rows.length === 0) {
                  DBCon.query(req.session, "delete from " + AppConfig.dokusys.tbl_links + " where id=" + link_id,
                    function () {
                      send(res, { err: "" });
                    });
                } else {
                  send(res, { err: "" });
                }
              });
          });
      });
  });

router.route("/files")
  .post( multer({ dest: AppConfig.dokusys.upload_tmp }), function(req,res){
    function insertFile() {
      var qry = mysql.format(" set ?", [{
        link_id: req.body.link_id,
        filename: filename,
        version: req.body.version,
        user: req.session.user,
        time: ts
      }]);
      qry = "insert into " + AppConfig.dokusys.tbl_uploads + qry;
      DBCon.query(req.session, qry, function () {
        send(res, { err: "", id: req.body.link_id });
      });
    }
    //req.setBodyEncoding("binary");
    var ts = new Date() / 1000 | 0;
    var filename = "T" + req.body.topic_id.lpad(0, 8) + "_" + ts + "." + req.files.anhang.extension.replace(/\\/, "\\\\");
    fs.rename(req.files.anhang.path, AppConfig.dokusys.path + filename, function (err) {
      if (err) {
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
          qry = "insert into " + AppConfig.dokusys.tbl_links + qry;
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
