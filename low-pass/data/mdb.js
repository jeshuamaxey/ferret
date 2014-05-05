var db = require('monk')('localhost/low-pass');
var tweets = db.get('tweets');

var twitterdb = {
  storeTweets: function(term, newTweets){
                 for (var t in newTweets){
                   t.lowpassTerm = term;
                 }
                 tweets.insert(newTweets);
               }
};
