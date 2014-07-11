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
    var de = new Date(time - 24*60*60*1000);
    var ds = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    var des = de.getFullYear() + '-' + (de.getMonth() + 1) + '-' + de.getDate();
    query.until = ds;
    query.since= des;
    return this.makeSample(query);
  },

  guessSample: function(term, time, ref){
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
  },

  getSampleAtTime: function(search, time, allow, ref){
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
    })
    .fail(function(reason){
      console.log(reason.message);
      console.log('no first reference ' + new Date(time) + ' give up now');
      throw new Error('twitter index does not go back this far');
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
    })
    .fail(function(reason){
      console.log(reason.message);
      console.log('no tweets found at ' + new Date(time) + ' falling back');
      return me.getCachedSampleFromDate('twitter', time - 24*60*60*1000)
        .then(me.sampleFromBundle);
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
      throw new Error('not enough tweets');
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
                    console.log(tweets.length);
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
