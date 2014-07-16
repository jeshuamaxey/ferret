var express = require('express');
var router = express.Router();
var auth = require('./auth');
var series = require('../data/series');
var twitter = require('../data/twitter');
var db = require('../data/mdb');

var dataMin = 50;

//TODO:fix for api prefix
router.get('/search', function(req, res){
  if(req.session){
    console.log(JSON.stringify(req.session));
  } else {
    console.log("no session");
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
      scale = 14*24*60*60*1000; 
      end = start - scale;
    } else {
      end = Number(end);
    }

    var key = new auth.key().withAppAccess();

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
  var term = req.query.term;
  var time = Number(req.query.start);
  if(!term || !time){
    res.json({err: 'bad query'});
    res.end();
    return;
  }

  var key = new auth.key().withAppAccess();
  new twitter(key).getSampleAtTime(term, time/1000)
  .then(db.tweetsForSample)
  .then(function(tweets){
    res.json(tweets);
    res.end();
  });
});

module.exports = router;
