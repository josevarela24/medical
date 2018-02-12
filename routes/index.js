var express = require('express');
var router = express.Router();

// render() is used to render a specified template along with the values
// of named variables passed in an object, and then send the result as a
// response
/* GET home page. */
router.get('/', function(req, res, next) {
  //res.redirect('/catalog');
  res.render('home', { title: 'Title' });
});

module.exports = router;
