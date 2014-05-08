var db = require('monk')('localhost/low-pass');
var tweets = db.get('tweets');
var samples = db.get('samples');

var tweetFilter = function(time) {
  return {$gte: (time - 1000), $lte: (time + 1000)};
};

var sampleFilter = function(time) {
  var f = {$gte: (time - 60*60*1000), $lte: (time + 60*60*1000)}
  console.log(new Date(f.$gte) + ' to ' + new Date(f.$lte));
  return f;
};

var twitterdb = {
  storeTweets: function(term, newTweets){
                 for (var t in newTweets){
                   newTweets[t].lpterm = term;
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

  getSamples: function(term, cb){
                //TODO:mapreduce this
                samples.distinct('time', {term: term}, function(err, times){
                  if(times.length == 0){
                    cb([]);
                    return;
                  }

                  var toAdd = times.length;
                  var ss = [];
                  var adder = function(err, s){
                    ss.push(s);
                    toAdd--;
                    if(!toAdd){
                      cb(ss);
                      toAdd = 0;
                    }
                  }

                  for (t in times){
                    samples.findOne({time:times[t]}, adder);
                  }
                });
              },

  getTweets: function(term, startid, size, cb){
               var q = {lpterm: term};
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

  //unused
  haveSample: function(term, time, cb){
                console.log('checking if I have any ' + term);
                
                samples.findOne({term: term, time: sampleFilter(time), density: {$gt:5} }, function(err, doc){
                  cb(err, doc);
                });
              },

  haveTweets: function(term, time, cb){
                tweets.findOne({lpterm: term, lptime: tweetFilter(time)}, function(err, doc){
                  if (!doc){
                    cb({message: 'no doc'});
                  } else {
                    tweets.find({lpsample: doc.lpsample}, function(err, docs){
                      cb(err, docs)
                    });
                  }
                });
              }
};

module.exports = twitterdb;
