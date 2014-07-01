var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('poly-index', {
		'title': 'Poly Low Pass'
	});
});

module.exports = router;