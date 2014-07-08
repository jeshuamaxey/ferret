var express = require('express');
var router = express.Router();
var series = require('../data/series');

var dataMin = 50;

//TODO:fix for api prefix
router.get('/search', function(req, res){
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
  var start = req.query.start;
  var end = req.query.end;
  console.log(start);
  console.log(end);
  if(start && end){
    console.log('selecting');
    twitter.getAllTweets(term, new Date(start).getTime(), new Date(end).getTime(), function(err, tweets){
      res.json(JSON.stringify(tweets));
      res.end();
    });
  }else{
    res.json({message: 'bad query'});
    res.end();
  }
});
module.exports = router;
