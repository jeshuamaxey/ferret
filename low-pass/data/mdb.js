var db = require('monk')('localhost/low-pass');
var tweets = db.get('tweets');

var twitterdb = {
  storeTweets: function(term, newTweets){
                 for (var t in newTweets){
                   t.lowpassTerm = term;
                 }
                 tweets.insert(newTweets);
               },

  getTweets: function(term, startid, size, cb){
               var q = {term: term};
               if (startid){
                 q.$lte = startid;
               }
               tweets.find(q, function(err, doc){
                 if (err){
                   cb(err, doc);
                 } else {
                   cb(err, doc.splice(0,size));
                 }
               });
             },
};

module.exports = twitterdb;
