var twitter = require('../data/twitter');
var express = require('express');
var router = express.Router();

var passport = require('passport')
var OAuthStrategy = require('passport-oauth').OAuthStrategy;

passport.use('twitter', new OAuthStrategy({
    //authorizationURL: 'https://www.provider.com/oauth2/authorize',
    userAuthorizationURL: 'https://api.twitter.com/oauth/authorize',
    requestTokenURL: 'https://api.twitter.com/oauth/request_token',
    accessTokenURL: 'https://api.twitter.com/oauth/access_token',
    callbackURL: 'http://localhost:3000/auth/twitter/callback', // to change
    consumerKey: twitter.key.key,
    consumerSecret: twitter.key.keySecret
  },

  function(token, tokenSecret, profile, done) {
    console.log('access token:' + accessToken);
    done(null, profile);
    //done(err, user);
  }
));

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
