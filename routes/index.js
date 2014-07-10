var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		'title': 'Ferret'
	});
});

/* GET about page. */
router.get('/about', function(req, res) {
	res.render('about', {
		'title': 'About Ferret'
	});
});

/* GET about login. */
router.get('/login', function(req, res) {
	res.render('login', {
		'title': 'Login to Ferret'
	});
});

module.exports = router;
