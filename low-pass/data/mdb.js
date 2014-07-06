var db = require('monk')('localhost/low-pass');
var tweets = db.get('tweets');
var samples = db.get('samples');
var Q = require('q');

var dayFilter = function(time) {
  var d = new Date(time);
  var dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var startTime = dayStart.getTime();
  return {$gte: startTime, $lte: time + 24*60*60*1000};
};

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
                   newTweets[t].lptime = new Date(newTweets[t].created_at).getTime();
                 }
                 //console.log(newTweets);
                 tweets.insert(newTweets);
                 return Q(newTweets);
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
                  console.log(term + ' ' + times.length);
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

  getTweetsTime: function(term, start, end, cb){
                   var q = {lpterm: term, lptime :{$gte: start, $lte: end}};
                   console.log(q);
                  tweets.distinct('id', q, function(err, ids){
                  console.log(term + ' ' + ids.length);
                  if(ids.length == 0){
                    cb([]);
                    return;
                  }

                  var toAdd = ids.length;
                  var ts = [];
                  var adder = function(err, t){
                    ts.push(t);
                    toAdd--;
                    if(!toAdd){
                      cb(ts);
                      toAdd = 0;
                    }
                  }

                  for (id in ids){
                    tweets.findOne({id: ids[id]}, adder);
                  }
                  });

                  /*
               var q = {lpterm: term,
               lptime: {$gte : start, $lte: end}};
               console.log(q);
               tweets.find(q, function(err, doc){
                 cb(doc);
               });
               */
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
              },

  haveTweetsForDate: function(term, time, cb){
                       //TODO:change to sample
                       tweets.find({lpterm: term, lptime: dayFilter(time)}, cb);
                     },

  close: function(){
           db.close();
         }
};

module.exports = twitterdb;
