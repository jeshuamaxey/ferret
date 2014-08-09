var t = require('./twitter');
var db = require('./mdb');
var Q = require('q');

var sampler = {

  getHalfDaySamples: function(term, start, end, key){
    var twitter = new t(key);
    var allSamples = [];
    for (var time = start; time > end; time -= 24*60*60*1000){
      allSamples.push(twitter.getSampleFromDate(term, time));
    }
    return this.settleAndPrettify(allSamples);
  },

  getDaySamples: function(term, start, end, key){
    var me = this;
    var twitter = new t(key);
    var allSamples = [];
    for (var time = start; time > end; time -= 24*60*60*1000){
      allSamples.push(twitter.getCachedSampleFromDate(term, time));
    }
    return me.settleSeries(allSamples)
    .then(me.stripSamples)
    .then(function(series){
      //now lets fill in the gaps
      var fillers = []; 

      for (var s = 1; s < series.length - 1; s++){
        var id = series[s-1].minid/2 + series[s].maxid/2;
        fillers.push(twitter.getCachedSampleFromId(term, id));
      }

      return me.settleSeries(fillers)
      .then(me.stripSamples.bind(me))
      .then(function(extraSamples){
        return Q(me.mergeSamples([series, extraSamples]));
      })
      .then(me.prettifySeries.bind(me));
    });
  },

  mergeSamples: function(sampleArray){
    return [].concat.apply([], sampleArray)
    .sort(function(a, b){
      if(a.time < b.time){
        return 1;
      } else if (a.time > b.time){
        return -1;
      }
      return 0;
    });
  },

  getSeriesFromSamples: function(term, start, end, key){
    var twitter = new t(key);
    var n = 20;
    var interval = (start - end)/n;
    var allSamples = [];
    var allow = interval/10;
    var references = Q.all(
        [twitter.getReferenceBefore(term, start),
        twitter.getReferenceAfter(term, end)]);

    for (var time = start; time > end; time -= interval){
      allSamples.push(twitter.getSampleAtTime(term, time, allow, references));
    }

    return this.settleAndPrettify(allSamples);
  },

  settleAndPrettify: function(samplePromises){
    return this.settleSeries
    .then(this.stripSamples)
    .then(this.prettifySeries);
  },

  settleSeries: function(allSamples){
    return Q.allSettled(allSamples)
      .then(function(samples){
        //make them look good
        return Q(samples
          .filter(function(sample){
            if(sample.state === "rejected"){
              console.log(sample.reason.stack);
            }
            return sample.state === "fulfilled";
          })
          );
      });
  },

  
  stripSamples: function(promises){
    return Q(
      promises.map(function(promise){
        return promise.value.sample;
      })
    );
  },

  prettifySeries: function(samples){
    return Q(
      samples.map(function(s){
        return {date: s.time, tps: s.idrate};
      })
    );
  }

}

module.exports = sampler;
