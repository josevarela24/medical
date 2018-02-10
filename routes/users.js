var express = require('express');
var router = express.Router();

// defines a callback that will be invoked whenever an HTTP GET request with
// the correct pattern is deteccted
// this callback has a third argument, next, so it is actually a middleware
// function rather than a simple route callback
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// exports the router from the module (this allows the file to
// be imported into app.js)
module.exports = router;
