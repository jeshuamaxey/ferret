var fs = require('fs');
var Q = require('q');
var path = require('path');
var Twit = require('twit');
var db = require('./mdb');

var twitter = {
  
  _T: null, 

  get key() {
    var file = path.join (__dirname, 'twitterapi.json');
    var data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  },

  get T() {
    if (!this._T){
      this._T = new Twit({
            consumer_key: this.key.key,
            consumer_secret: this.key.keySecret,
            access_token: this.key.token,
            access_token_secret: this.key.tokenSecret
          });
    }
    return this._T;
  },

  getSampleFromId: function(search, id){
    var query = { q: search, result_type: 'recent'};
    query.max_id = id;
    return this.makeSample(query);
  },

  getSampleFromDate: function(search, time){
    var query = { q: search, result_type: 'recent'};
    var d = new Date(time);
    var ds = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    query.until = ds;
    return this.makeSample(query);
  },

  guessSample: function(term, time){
    var me = this;
    return me.getSamplesAroundTime(term, time)
           .then(function(samples){
             //A < B
             if(sampleA.time == sampleB.time){
               return Q(sampleA);
             }
             var sampleA = samples[0];
             var sampleB = samples[1];
             estimatedId = sampleA.minid + 
               (sampleB.maxid - sampleA.minid)*
               (time - sampleA.mintime)/(sampleB.maxtime - sampleA.mintime);
             console.log('' + sampleA.mintime + ' ' + sampleB.maxtime)

             return me.getCachedSampleFromId(term, estimatedId);
           });
  },

  getSampleAtTime: function(search, time, allow){
    var me = this;
    if(!allow){
      allow = 0;
    }

    return db.haveSampleForInterval(search, time - allow, time + allow)
           .then(function(sample){
             if(sample){
               return Q({sample:sample});
             } else {
               return me.guessSample(search, time);
             }
           });
  },

  sampleFromBundle: function(bundle){
    return Q(bundle.sample);
  },

  getReferenceBefore: function(term, time){
    var me = this;
    return db.getReferenceBefore(time)
    .then(function(reference){
      if(!reference){
        return me.getCachedSampleFromDate(term, time)
        .then(me.sampleFromBundle);
      } else {
        return Q(reference);
      }
    });
  },

  getReferenceAfter: function(term, time){
    var me = this;
    return db.getReferenceAfter(time)
    .then(function(reference){
      if(!reference){
        return me.getCachedSampleFromDate(term, time - 24*60*60*1000)
        .then(me.sampleFromBundle);
      } else {
        return Q(reference);
      }
    });
  },

  getSamplesAroundTime: function(term, time){
    var me = this;
    return Q.all([
        me.getReferenceBefore(term, time),
        me.getReferenceAfter(term, time)
        ]);
  },

  getCachedSampleFromId: function(search, id){
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
  },

  getCachedSampleFromDate: function(search, time){
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
  },

  sampleFromTweets: function(term, tweets){
    var avgTime = 0;
    var density = 0;
    var minid = 0;
    var maxid = 0;

    if (tweets.length < 2){
      console.log('not enough tweets');
    } else {
      tweets.sort(function(a,b){
        if(a.lptime < b.lptime){
          return -1;
        }
        if(a.lptime > b.lptime){
          return 1;
        }
        return 0;
      });

      var mintime = tweets[0].lptime;
      var maxtime = tweets[tweets.length - 1].lptime;

      avgTime = (maxtime + mintime) / 2; //for simplicity

      if (maxtime == mintime){
        console.log('sample size too small');
        density = tweets.length;
      } else {
        density = tweets.length / (maxtime - mintime);
      }

      minid = tweets[0].id;
      maxid = tweets[tweets.length - 1].id;
     }

     var sample = {
       term: term,
       time: avgTime,
       minid: minid,
       maxid: maxid,
       mintime: mintime,
       maxtime: maxtime,
       density: density
     };
     return db.storeSample(sample, tweets);
  },

  makeSample: function(query){
                var me = this;
                console.log(query);
                return Q.ninvoke(this.T, "get", 'search/tweets', query)
                  .then(function(response){
                    var tweets = response[0].statuses;
                    var term = query.q;
                    tweets.map(function(t){
                      t.lpterm = query.q;
                      t.lptime = new Date(t.created_at).getTime();
                    });
                    return me.sampleFromTweets(term, tweets);
                  });
              },

  finished: function(){
    db.close();
  }

};

module.exports = twitter;
