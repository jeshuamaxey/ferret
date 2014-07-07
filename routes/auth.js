var express = require('express');
var router = express.Router();

var passport = require('passport')
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

passport.use('provider', new OAuth2Strategy({
    //authorizationURL: 'https://www.provider.com/oauth2/authorize',
    tokenURL: 'https://api.twitter.com/oauth/request_token',
    callbackURL: 'http://localhost:3000/auth/twitter/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('access token:' + accessToken);
    done(null, null);
    //done(err, user);
  }
));

// Redirect the user to the OAuth 2.0 provider for authentication.  When
// complete, the provider will redirect the user back to the application at
//     /auth/provider/callback
router.get('/twitter', passport.authenticate('provider'));

// The OAuth 2.0 provider has redirected the user back to the application.
// Finish the authentication process by attempting to obtain an access
// token.  If authorization was granted, the user will be logged in.
// Otherwise, authentication has failed.
router.get('/twitter/callback', 
  passport.authenticate('provider', { successRedirect: '/',
                                      failureRedirect: '/' }));

module.exports = router;
