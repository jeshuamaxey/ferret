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
    return this.settleSeries(allSamples);
  },

  getDaySamples: function(term, start, end, key){
    var twitter = new t(key);
    var allSamples = [];
    for (var time = start; time > end; time -= 24*60*60*1000){
      allSamples.push(twitter.getSampleFromDate(term, time));
    }
    //TODO:change settle to not prettify
    return this.settleSeries(allSamples)
    .then(function(series){
      //now lets fill in the gaps
      fillers = [];
      for (var s = 1; s < series.length -1){
        var id = series[s-1].minid + series[s].maxid;
        fillers.push(twitter.getSampleFromId(term, id));
      }
      return this.settleSeries(fillers)
      .then(function(extraSeries){

      });
    })
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

    return this.settleSeries(allSamples);
  },

  settleSeries: function(allSamples){
    return Q.allSettled(allSamples)
      .then(function(samples){
        //make them look good
        return Q(samples
          .filter(function(sample){
            if(sample.state === "rejected"){
              console.log(sample.reason);
            }
            return sample.state === "fulfilled";
          })
          .map(function(sample){
          var s = sample.value.sample;
          return {date: s.time, tps: s.idrate};
          })
          );
      });
  }

}

module.exports = sampler;
