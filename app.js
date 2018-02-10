// import some useful node libraries
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

// require() modules from routes directory
// contain code for handling paritcular sets of related routes (URL paths)
var index = require('./routes/index');
var users = require('./routes/users');
var catalog = require('./routes/catalog');  //Import routes for "catalog" area of site

// app object using imported express module
var app = express();

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://username:password@ds249565.mlab.com:49565/medicaldb';
mongoose.connect(mongoDB, {
  useMongoClient: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use() to call middleware libraries into the request handling chain
// Express.static middleware to get Express to serve all the static files in 
// the directory '/public' in the project root
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); // Add this after the bodyParser middlewares!
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// after middleware set up, add our previously imported route-handling
// code to the request handling chain. Imported code will define particular
// routes for the different parts of the site
app.use('/', index);
app.use('/users', users);
app.use('/catalog', catalog);  // Add catalog routes to middleware chain.

// the last middleware in the file adds handler methods for errors and HTTP 404
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Express application object (app) now fully configured; last step is to 
// add it to the module exports to allow it to be imported by /bin/www
module.exports = app;
