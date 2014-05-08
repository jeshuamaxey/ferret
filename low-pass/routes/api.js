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
    var scale = 14*24*60*60*1000; //minute, will soon be relevant
    twitter.sampleTerm(term, scale, function(err, series){
      res.json(JSON.stringify(series));
      res.end();
    });
  }
});

module.exports = router;
