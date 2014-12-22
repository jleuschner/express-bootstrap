var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
//var multer = require('multer');

var routes = require('./routes/rt_index');
var dokusys = require('./routes/rt_dokusys');
var users = require('./routes/rt_users');
var config= require('./routes/rt_config');
var io= require('./routes/rt_io');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: '1f2g3h4j5k67890QWERTY'}));
/*
app.use(multer({
  dest: "./uploads/"
}))
*/

// Config laden
var AppConfig= require("./AppConfig")

global.DB = mysql.createConnection({
      host: AppConfig.DB.server,
      database: AppConfig.DB.instance,
      user: AppConfig.DB.user,
      password: AppConfig.DB.password
    });
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
    console.log("FATAL: "+err.code);
    console.log("FATAL: "+err.text);
    process.exit(1);
  }
});

app.use('/', routes);
app.use('/users', users);
app.use('/dokusys', dokusys);
app.use('/config', config);
app.use('/io', io);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
