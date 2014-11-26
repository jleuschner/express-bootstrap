var express = require('express');
var router = express.Router();
var AppConfig = require("../AppConfig");
var DBCon = require('../lib/dbconnection');


router.get('/', function (req, res) {
  res.render('DokuSys');
});

function send(res,data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('charset', 'utf-8');
  res.send(data);
}

router.get('/getList', function (req, res) {
  DBCon.query(req.session, "select id, parent, topic,keywords from "+AppConfig.tables.dokusys_topics+" order by parent,topic",
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

router.get('/get', function (req, res) {
  DBCon.query(req.session, "select id, parent, topic, keywords, topictext, dokustatus, user, time from " + AppConfig.tables.dokusys_topics + " where id=" + req.query.id,
    function (data) {
      if (data.err) {
        send(res, data);
        return;
      }
      getParents(req.session,data.rows[0].parent,[], function(parents){
        data.rows[0].parents = parents;
        send(res, data);
      });
    });
});

router.post('/set', function (req, res) {
  var post = req.body;
  console.log(post);
  DBCon.query(req.session, "update " + AppConfig.tables.dokusys_topics 
    + " set parent=" +post.parent
    + ",topic='" + post.topic +"'"
    + ",keywords='" + post.keywords + "'"
    + ",topictext='" + post.topictext + "'"
    //+ , dokustatus, user, time 
    + " where id=" + post.id,
    function (data) {
      send(res, { err: "" });
    }
  );

});

module.exports = router;
