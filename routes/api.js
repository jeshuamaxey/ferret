var express = require('express');
var router = express.Router();
var series = require('../data/series');
var twitter = require('../data/twitter');

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
      start = new Date(start).getTime()
    }
    if (!end){
      scale = 14*24*60*60*1000; 
    } else {
      scale = new Date(end).getTime() - start;
    }

    series.getSeriesFromSamples(term, start, scale)
    .then(function(series){
      res.json(JSON.stringify(series));
      res.end();
    });
  }
});

router.get('/select', function(req, res){
  var term = req.query.term;
  var time = Number(req.query.end);
  twitter.getSampleAtTime(term, time)
  .then(function(tweets){
    res.json(JSON.stringify(tweets));
    res.end();
  });
});

module.exports = router;
