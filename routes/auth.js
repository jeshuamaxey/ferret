var twitter = require('../data/twitter');
var express = require('express');
var router = express.Router();

var passport = require('passport')

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Redirect the user to the OAuth 2.0 provider for authentication.  When
// complete, the provider will redirect the user back to the application at
//     /auth/provider/callback
router.get('/twitter', passport.authenticate('twitter'));

// The OAuth 2.0 provider has redirected the user back to the application.
// Finish the authentication process by attempting to obtain an access
// token.  If authorization was granted, the user will be logged in.
// Otherwise, authentication has failed.
router.get('/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                      failureRedirect: '/' }));

module.exports = router;
