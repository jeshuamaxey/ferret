var express = require('express');
var router = express.Router();

/*redirect for the sake of sessions*/
app.get('/*', function(req, res, next) {
  if (req.headers.host.match(/^www\./) != null) {
    res.redirect("http://" + req.headers.host.slice(4) + req.url, 301);
  } else {
    next();
  }
});

/* GET home page. */
router.get('/', function(req, res) {
  if(req.session.passport.user){
    res.render('index', {
      'title': 'Ferret'
    });
  } else {
    res.redirect('/login');
  }
});

/* GET about page. */
router.get('/about', function(req, res) {
	res.render('about', {
		'title': 'About Ferret'
	});
});

/* GET login page. */
router.get('/login', function(req, res) {
	res.render('login', {
		'title': 'Login to Ferret'
	});
});

/* GET faq page. */
router.get('/faq', function(req, res) {
	res.render('faq', {
		'title': 'Ferret FAQs'
	});
});

/* GET provacy page. */
router.get('/privacy', function(req, res) {
	res.render('privacy', {
		'title': 'Ferret Privacy'
	});
});

module.exports = router;
