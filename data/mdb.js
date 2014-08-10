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

  getReferenceBefore: function(time){
    return Q(samples.findOne({mintime: {$gt: time}}));
  },

  getReferenceAfter: function(time){
    return Q(samples.findOne({maxtime: {$lt: time}}));
  },

  getAllSamplesSorted: function(time){
    return Q(samples.find({},{sort: {time: 1}}));
  },

  getSampleBefore: function(term, time){
    return Q(samples.find(
      {
        term: term, 
        time: {$lte: time}
      },
      {sort: {time: 1}}
    ))
    .then(function(samples){
      return Q(samples[samples.length-1]);
    });
  },

  storeTweets: function(term, newTweets){
    for (var t in newTweets){
     newTweets[t].lpterm = term;
     newTweets[t].lptime = new Date(newTweets[t].created_at).getTime();
    }
    tweets.insert(newTweets);
    return Q(newTweets);
  },

  storeBundle: function(bundle){
    return Q.ninvoke(samples, "insert", bundle.sample)
    .then(function(doc){
      bundle.tweets.forEach(function(tweet){
        tweet.lpsample = doc._id;
      })
      tweets.insert(bundle.tweets);
      console.log('stored ' + doc._id + ' ' + bundle.tweets.length);
      return Q({tweets: bundle.tweets, sample: doc})
    });
  },

  storeSample: function(sample, ts){
    return Q.ninvoke(samples, "insert", sample)
    .then(function(doc){
      for (t in ts){
        ts[t].lpsample = doc._id;
      }
      tweets.insert(ts);
      return Q({tweets: ts, sample: doc})
    });
  },

  getSamples: function(term, cb){
    return Q.ninvoke(samples, "find", {term: term});

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

  haveSampleForId: function(term, id, cb){
    var me = this;
    return Q(
      samples.findOne(
        {lpterm: term, maxid:{$gte:id}, minid:{$lte:id}}
      )
    );
  },

  haveTweetsForId: function(term, id, cb){
    var me = this;
    return samples.findOne( 
        {lpterm: term, maxid:{$gte:id}, minid:{$lte:id}})
    .then(function(sample){
      return me.tweetsForSample(term, sample);//broken
    });
  },

  haveSampleForInterval: function(term, start, end){
    return Q(
      samples.findOne(
        {term: term, time: {$gte:start, $lte:end}}
      )
      .then(function(sample){
        if(!sample){
          throw new Error("no samples in time range");
        }
        return Q(sample)
      }));
  },

  haveSampleForDate: function(term, time){
    return samples.findOne(
      {term: term, time: dayFilter(time)},
      {sort: {time: 1}}
    );
  },

  haveTweetsForDate: function(term, time){
    return tweets.find({lpterm: term, lptime: dayFilter(time)});
  },

  tweetsForSample: function(sample){
    var id = samples.id(sample._id);
    return Q(tweets.find({lpsample: id}));
  },

  close: function(){
    db.close();
  },

  clear: function(){
    samples.drop();
    tweets.drop();
  }

};

module.exports = twitterdb;
