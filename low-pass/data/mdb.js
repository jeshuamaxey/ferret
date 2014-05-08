var db = require('monk')('localhost/low-pass');
var tweets = db.get('tweets');
var samples = db.get('samples');
var cfilter = function(time) {
  return {$gte: (time - 1000), $lte: (time + 1000)};
};

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

  getSamples: function(term, cb){
                //TODO:mapreduce this
                samples.distinct('time', function(err, times){
                  var toAdd = times.length;
                  var ss = [];
                  var adder = function(err, s){
                    ss.push(s);
                    toAdd--;
                    if(!toAdd){
                      console.log(ss);
                      cb(err, ss);
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

  haveSample: function(term, time, cb){
                samples.findOne({term: term, time: cfilter(time)}, function(err, doc){
                  cb(err, doc);
                });
              },

  haveTweets: function(term, time, cb){
                tweets.findOne({lpterm: term, lptime: cfilter(time)}, function(err, doc){
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
