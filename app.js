var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var OAuthStrategy = require('passport-oauth').OAuthStrategy;

var routes = require('./routes/index');
var api = require('./routes/api');
var auth = require('./routes/auth');
var users = require('./routes/users');
var twitter = require('./data/twitter');

// var users = require('./routes/users');
// var polyRoutes = require('./routes/poly-routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.pretty = true;

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'tochange', resave: true, saveUninitialized: true}));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

passport.use('twitter', new OAuthStrategy({
    userAuthorizationURL: 'https://api.twitter.com/oauth/authorize',
    requestTokenURL: 'https://api.twitter.com/oauth/request_token',
    accessTokenURL: 'https://api.twitter.com/oauth/access_token',
    callbackURL: twitter.key.callbackURL,
    consumerKey: twitter.key.key,
    consumerSecret: twitter.key.keySecret
  },

  function(token, tokenSecret, profile, done) {
    console.log('access token:' + token);
    profile.token = token;
    profile.tokenSecret = tokenSecret;
    done(null, profile);
  }
));

app.use('/', routes);
app.use('/api', api);
app.use('/auth', auth);
app.use('/users', users);
// app.use('/users', users);

app.use(express.static(path.join(__dirname, 'public')));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err.stack);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
