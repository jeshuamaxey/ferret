var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.sendfile('index.html', {root: './public'});
  /*
  res.render('index', {
  	'title': 'Low Pass'
  });
  */
});

module.exports = router;
