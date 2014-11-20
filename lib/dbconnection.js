var mysql = require('mysql');
var AppConfig= require("../AppConfig")

module.exports = {
  connect: function (user, pass, cb) {
    var DB = mysql.createConnection({
      host: AppConfig.login.MySQLServer,
      database: AppConfig.login.MySQLDatabase,
      user: user,
      password: pass
    })
    DB.connect(function (err) {
      if (err) {
        switch (err.code) {
          case 'ENOTFOUND':
            err.text = "DNS: " + AppConfig.login.MySQLServer + " nicht auflösbar!";
            break;
          case 'ETIMEDOUT':
            err.text = "TimeOut: " + AppConfig.login.MySQLServer + " reagiert nicht!";
            break;
          case 'ER_ACCESS_DENIED_ERROR':
            err.text = "Zugriff verweigert - Username/Passwort falsch?";
            break;
          case 'ER_DBACCESS_DENIED_ERROR':
            err.text = "Kein Zugriff auf Datenbank '"+AppConfig.login.MySQLDatabase+"@"+AppConfig.login.MySQLServer+"'";
            break;
          default:
            err.text = "Error_Code: " + err.code;
            break;
        }
        cb({ err: err, DBconnection: null })
        return;
      }
      cb({ err: err, DBconnection: DB })
      return;
    })
  },
  queryDB: function (session, qry, cb) {
    if (!session) {
      console.log("NOSESS")
      if (cb) cb("NOSESSION")
      return
    }
    this.connectDB(session.user, session.pass, function (userDB) {
      if (userDB.DBCode != "OK") {
        console.log("ERR: " + userDB.DBCode)
        if (cb) cb(userDB.DBCode)
        return
      }
      userDB.DBconnection.query(qry, function (err, rows, fields) {
        if (err) {
          console.log(err)
        }
        if (cb) cb(err, rows, fields)
      })
    })
  }

};

