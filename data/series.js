var twitter = require('./twitter');
var db = require('./mdb');
var Q = require('q');

var sampler = {
  getSeriesFromSamples: function(term, start, end){

                        },

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
}

module.exports = sampler;
