var Q = require('q');
var Twit = require('twit');
var db = require('./mdb');

function twitter(key) {
  this.T = new Twit(key.data);
};

twitter.prototype.getSampleFromId = function(search, id){
  var query = { q: search, result_type: 'recent'};
  query.max_id = id;
  return this.makeSample(query);
};

twitter.prototype.getSampleFromDate = function(search, time){
  var query = { q: search, result_type: 'recent'};
  var d = new Date(time);
  var de = new Date(time - 24*60*60*1000);
  var ds = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  var des = de.getFullYear() + '-' + (de.getMonth() + 1) + '-' + de.getDate();
  query.until = ds;
  query.since= des;
  return this.makeSample(query);
};

twitter.prototype.guessSample = function(term, time, ref){
  var me = this;

  if (!ref){
    ref = me.getSamplesAroundTime(term, time)
  }

  return ref
         .fail(function(reason){
           console.log(reason.message);
           console.log('trying more specific reference');
           return me.getSamplesAroundTime(term, time)
         })
         .then(function(samples){
           //A < B
           var sampleA = samples[0];
           var sampleB = samples[1];

           estimatedId = sampleA.minid + 
             (sampleB.maxid - sampleA.minid)*
             (time - sampleA.mintime)/(sampleB.maxtime - sampleA.mintime);
         console.log('' + sampleA.minid + ' ' + sampleB.maxid);
         console.log('' + new Date(sampleA.mintime) + ' ' + new Date(sampleB.maxtime));
         console.log(estimatedId);

           return me.getCachedSampleFromId(term, estimatedId)
           .fail(function(reason){
             console.log(JSON.stringify(reason));
             return Q({sample:{time:time, density:0}});
           });
         });
};

twitter.prototype.getSampleAtTime = function(search, time, allow, ref){
  var me = this;
  if(!allow){
    allow = 0;
  }

  return db.haveSampleForInterval(search, time - allow, time + allow)
    .then(function(sample){
        console.log(sample.density);
      return Q({sample:sample});
    })
    .fail(function(err){
           console.log(err.message);
      return me.guessSample(search, time, ref);
    })
};

twitter.prototype.sampleFromBundle = function(bundle){
  return Q(bundle.sample);
};

twitter.prototype.getReferenceBefore = function(term, time){
  var me = this;
  return db.getReferenceBefore(time)
  .then(function(reference){
    if(!reference){
      return me.getCachedSampleFromDate(term, time)
      .then(me.sampleFromBundle);
    } else {
      return Q(reference);
    }
  })
  .fail(function(reason){
    console.log(reason.message);
    console.log('no first reference ' + new Date(time) + ' give up now');
    throw new Error('twitter index does not go back this far');
  });
};

twitter.prototype.getReferenceAfter = function(term, time){
  var me = this;
  return db.getReferenceAfter(time)
  .then(function(reference){
    if(!reference){
      return me.getCachedSampleFromDate(term, time - 24*60*60*1000)
      .then(me.sampleFromBundle);
    } else {
      return Q(reference);
    }
  })
  .fail(function(reason){
    console.log(reason.message);
    console.log('no tweets found at ' + new Date(time) + ' falling back');
    return me.getCachedSampleFromDate('twitter', time - 24*60*60*1000)
      .then(me.sampleFromBundle);
  });

};

twitter.prototype.getSamplesAroundTime = function(term, time){
  var me = this;
  return Q.all([
      me.getReferenceBefore(term, time),
      me.getReferenceAfter(term, time)
      ]);
};

twitter.prototype.getCachedSampleFromId = function(search, id){
  var me = this;
  return db.haveSampleForId(search, id)
    .then(function(sample){
      if(!sample){
        return me.getSampleFromId(search, id)
      } else {
        console.log('have sample');
        return Q(sample);
      }
    });
};

twitter.prototype.getCachedSampleFromDate = function(search, time){
  var me = this;
  return db.haveSampleForDate(search, time)
         .then(function(sample){
           if(sample){
             return db.tweetsForSample(sample)
              .then(function(tweets){
                return Q({sample:sample, tweets:tweets});
              });
           }
           return me.getSampleFromDate(search, time);
         });
};

twitter.prototype.sampleFromTweets = function(term, tweets){
  var avgTime = 0;
  var density = 0;
  var minid = 0;
  var maxid = 0;

  if (tweets.length < 2){
    throw new Error('not enough tweets');
  } else {
    var times = tweets.map(function(t){
      return t.lptime;
    });

    var mintime = Math.max.apply(null, times);
    var maxtime = Math.min.apply(null, times);

    avgTime = Math.round(times.reduce(function(prev, current){
      return prev + current;
    }) / tweets.length);

    if (maxtime == mintime){
      console.log('sample size too small');
      density = tweets.length;
    } else {
      density = tweets.length / (maxtime - mintime);
    }

    var ids = tweets.map(function(t){
      return t.id;
    });

    maxid = Math.max.apply(null, ids);
    minid = Math.min.apply(null, ids);
    var idrate = (maxid - minid) / tweets.length;

   }

   var sample = {
     term: term,
     time: avgTime,
     minid: minid,
     maxid: maxid,
     mintime: mintime,
     maxtime: maxtime,
     density: density,
     idrate: idrate 
   };
   return db.storeSample(sample, tweets);
};

twitter.prototype.makeSample = function(query){
  var me = this;
  console.log(query);
  return Q.ninvoke(this.T, "get", 'search/tweets', query)
    .then(function(response){
      var tweets = response[0].statuses;
      console.log(tweets.length);
      var term = query.q;
      tweets.map(function(t){
        t.lpterm = query.q;
        t.lptime = new Date(t.created_at).getTime();
      });
      return me.sampleFromTweets(term, tweets);
    });
};

twitter.prototype.finished = function(){
  db.close();
};


module.exports = twitter;
