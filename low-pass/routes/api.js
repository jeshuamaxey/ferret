var express = require('express');
var router = express.Router();
var twitter = require('../data/twitter');

var dataMin = 50;

//TODO:fix for api prefix
router.get('/search', function(req, res){
  var term = req.query.q
  if (!term){
    res.json({message: 'bad query'});
    res.end();
  }else{
    var scale = 12*60*60*1000; //minute, will soon be relevant
    twitter.sampleTerm(term, scale, function(err, series){
      res.json(JSON.stringify(series));
      res.end();
    });
  }
});

router.get('/select', function(req, res){
  var term = req.query.term;
  var start = req.query.start;
  var end = req.query.end;
  if(start && end){
    twitter.getAllTweets(term, start*1000, end*1000, function(err, tweets){
      res.json(JSON.stringify(tweets));
      res.end();
    });
  }else{
    res.json({message: 'bad query'});
    res.end();
  }
});
module.exports = router;
