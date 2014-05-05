var express = require('express');
var router = express.Router();
var twitterdb = require('../data/mdb');
var twitter = require('../data/twitter');

var dataMin = 50;

//TODO:fix for api prefix
router.get('/generate/:term', function(req, res){
  var term = req.param('term',null);

  function genTime(tweets){
    console.log(tweets.length);
    res.json({a:1});
    res.end();
  }

  var getMore = function (tweets){
    console.log(tweets.length);

    if(tweets.length < dataMin){
      var morePages = (dataMin - tweets.length) / 15;
      console.log('getting ' + morePages + ' more pages');
      var newTweets = [];
      var min = 0;

      if(tweets.length > 0){
        min = twitter.getMinId(tweets);
      }

      //TODO: store these tweets
      twitter.getTweets(term, null, morePages, min, function(err, ts){
        twitterdb.storeTweets(term, ts);
        var ts = tweets.concat(ts);
        genTime(ts);
      });
      return;
    }
    genTime(tweets);
    

  }

  twitterdb.getTweets(term, getMore);
});

module.exports = router;
