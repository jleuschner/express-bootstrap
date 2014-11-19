var mysql = require('mysql');
var AppConfig= require("../AppConfig")

module.exports = {
  connect: function (user,pass,cb) {
    var DB = mysql.createConnection({
      host: AppConfig.login.MySQLServer,
      database: AppConfig.login.MySQLDatabase,
      user: user,
      password: pass
    })
    DB.connect(function (err) {
      if (err) {
        //console.log("DB_ERR: "+err)
        cb({DBCode : err, DBconnection : DB })
        return;
      }
      cb({DBCode : err, DBconnection : DB })
    })
  },
  queryDB: function(session,qry,cb) {
    if (!session) {
      console.log("NOSESS")
      if (cb) cb("NOSESSION")
      return
    }
    this.connectDB(session.user,session.pass, function(userDB){
      if (userDB.DBCode!="OK") {
        console.log("ERR: "+userDB.DBCode)
        if (cb) cb(userDB.DBCode)
        return
      }
      userDB.DBconnection.query(qry, function (err, rows, fields) {
          if ( err) {
            console.log(err)
          }
          if (cb) cb (err,rows,fields)
        })
    })
  }

};

