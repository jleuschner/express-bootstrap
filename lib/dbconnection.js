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
            err.text = "Kein Zugriff auf Datenbank '" + AppConfig.login.MySQLDatabase + "@" + AppConfig.login.MySQLServer + "'";
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
  query: function (session, qry, cb) {
    console.log(session.user)
    if (!session.user) {
      console.log("NOSESS")
      if (cb) cb({ err: { code: "NOSESSION", text: "Datenbanksession nicht vorhanden!"} })
      return
    }
    this.connect(session.user, session.passwd, function (con) {
      if (con.err) {
        if (cb) cb(con)
        return
      } else {
        con.DBconnection.query(qry, function (err, rows, fields) {
          if (err) {
            console.log(err)
            err.text = qry;
          }
          if (cb) cb({ err: err, rows: rows, fields: fields })
        })
      }
    })
  }

};

