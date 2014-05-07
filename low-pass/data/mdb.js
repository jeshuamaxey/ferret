var db = require('monk')('localhost/low-pass');
var tweets = db.get('tweets');
var samples = db.get('samples');

var twitterdb = {
  storeTweets: function(term, newTweets){
                 for (var t in newTweets){
                   t.lowpassTerm = term;
                 }
                 tweets.insert(newTweets);
               },

  storeSample: function(sample, ts){
                 samples.insert(sample, function(err, doc){
                   for (t in ts){
                     ts[t].lpsample = doc._id;
                     ts[t].lpterm = doc.term;
                     ts[t].lptime = new Date(ts[t].created_at).getTime();
                   }
                   tweets.insert(ts);
                 });
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
