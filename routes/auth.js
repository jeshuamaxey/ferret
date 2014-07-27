var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();

var passport = require('passport')
var OAuthStrategy = require('passport-oauth').OAuthStrategy;

var twitteraccess;

try {
  var accessfile = path.join (__dirname, 'twitterapi.json');
  twitteraccess = JSON.parse(fs.readFileSync(accessfile, 'utf8'));
} catch (err) {
  twitteraccess = {
    key: process.env.FERRET_KEY,
    keySecret: process.env.FERRET_KEY_SECRET,
    token: process.env.FERRET_TOKEN,
    tokenSecret: process.env.FERRET_TOKEN_SECRET,
    callbackURL: (process.env.FERRET_HOST || "http://localhost:3000") 
    + "/auth/twitter/callback"
  }
}

passport.use('twitter', new OAuthStrategy({
    //authorizationURL: 'https://www.provider.com/oauth2/authorize',
    userAuthorizationURL: 'https://api.twitter.com/oauth/authorize',
    requestTokenURL: 'https://api.twitter.com/oauth/request_token',
    accessTokenURL: 'https://api.twitter.com/oauth/access_token',
    callbackURL: twitteraccess.callbackURL,
    consumerKey: twitteraccess.key,
    consumerSecret: twitteraccess.keySecret
  },

  function(token, tokenSecret, profile, done) {
    profile.token = token;
    profile.tokenSecret = tokenSecret;
    done(null, profile);
  }
));

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
                                      failureRedirect: '/login' }));

function key(){
  this.data = null;
}

key.prototype.withAppAccess = function(){
  this.data = {
    consumer_key: twitteraccess.key,
    consumer_secret: twitteraccess.keySecret,
    access_token: twitteraccess.token,
    access_token_secret: twitteraccess.tokenSecret
  };
  return this;
};

key.prototype.withUserAccess = function(token, tokenSecret){
  this.data = {
    consumer_key: twitteraccess.key,
    consumer_secret: twitteraccess.keySecret,
    access_token: token,
    access_token_secret: tokenSecret
  };
  return this;
};

module.exports = {router: router, key: key};
