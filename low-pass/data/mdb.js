var db = require('monk')('localhost/low-pass');
var tweets = db.get('tweets');

var twitterdb = {
  storeTweets: function(term, newTweets){
                 for (var t in newTweets){
                   newTweets[t].lpterm = term;
                 }
                 tweets.insert(newTweets);
               },
  getTweets: function(term, cb){
                   tweets.find({lpterm: term}, function(err, docs){
                     cb(docs);
                   });
                 },
  close: function() {db.close;}
};

module.exports = twitterdb;
