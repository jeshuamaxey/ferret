var express = require('express');
var Q = require('q');
var router = express.Router();
var auth = require('./auth');
var series = require('../data/series');
var twitter = require('../data/twitter');
var db = require('../data/mdb');

var dataMin = 50;

router.get('/search', function(req, res){
  if(req.session.passport.user){
    console.log(JSON.stringify(req.session));
    var key = new auth.key().withUserAccess(
      req.session.passport.user.token,
      req.session.passport.user.tokenSecret
    );
  } else {
      res.json({err: "Not signed in"});
      res.end();
      return;
  }
  var term = req.query.q;
  var start = req.query.start;
  var end = req.query.end;
  if (!term){
    res.json({message: 'bad query'});
    res.end();
  }else{
    if (!start){
      start = Date.now();
    } else {
      start = Number(start);
    }

    if (!end){
      scale = 10*24*60*60*1000; 
      end = start - scale;
    } else {
      end = Number(end);
    }

    series.getDaySamples(term, start, end, key)
    .then(function(series){
      res.json(JSON.stringify(series));
      res.end();
    })
    .fail(function(reason){
      res.json({err: reason.message});
      res.end();
    });
  }
});

router.get('/select', function(req, res){
  if(req.session.passport.user){
    console.log(JSON.stringify(req.session));
    var key = new auth.key().withUserAccess(
      req.session.passport.user.token,
      req.session.passport.user.tokenSecret
    );
  } else {
      res.json({err: "Not signed in"});
      res.end();
      return;
  }

  var term = req.query.term;
  var time = Number(req.query.start);
  if(!term || !time){
    res.json({err: 'bad query'});
    res.end();
    return;
  }

  db.getSampleBefore(term, time)
  .then(function(sample){
    req.session.minid = sample.minid;
    req.session.term = term;
    return Q({sample: sample});
  })
  .then(db.tweetsForSample)
  .then(function(tweets){
    res.json(tweets);
    res.end();
  })
  .fail(function(reason){
    console.log(reason);
    res.json({err: reason});
    res.end();
  });
});

router.get('/next', function(req, res){
  if(req.session.passport.user){
    console.log(JSON.stringify(req.session));
    var key = new auth.key().withUserAccess(
      req.session.passport.user.token,
      req.session.passport.user.tokenSecret
    );
  } else {
    res.json({err: "Not signed in"});
    res.end();
    return;
  }
  
  if(!req.session.minid){
    res.json({err: "Who are you?"});
    res.end();
    return;
  }

  new twitter(key).getSampleFromId(req.session.term, req.session.minid)
    .then(function(sample){
      req.session.minid = sample.minid;
      return Q(sample);
    })
    .then(db.tweetsForSample)
    .then(function(tweets){
      res.json(tweets);
      res.end();
    });
});
module.exports = router;
