var twitter = require('./twitter');
var db = require('./mdb');
var Q = require('q');

var sampler = {
  getSeriesFromSamples: function(term, start, end){
                          var n = 10;
                          var interval = (start - end)/n;
                          var allSamples = [];
                          var allow = interval/10;
                          for (var time = start; time > end; time -= interval){
                            allSamples.push(twitter.getSampleAtTime(term, time, allow));
                          }
                          return Q.all(allSamples)
                            .then(function(samples){
                              //make them look good
                              return Q(samples.map(function(sample){
                                var s = sample.sample;
                                return {date: s.time, tps: s.density};
                              }));
                            });
                        },

  /*
  getSeries: function(term, start, end){
               
               db.getSample
               var samples = [];
               var day = 24*60*60*1000;
               var days = [twitter.getCachedTweetsFromDate(start), 
                   twitter.getCachedTweetsFromDate(start - day)];

               var date = start - day;
               while(date > end){
                 days.push(twitter.getCachedTweetsFromDate(date));
                 date -= day;
               }

             }
             */

}

module.exports = sampler;
