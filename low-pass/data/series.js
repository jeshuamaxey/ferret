var twitter = require('./twitter');
var Q = require('q');

var sampler = {
  getSeries: function(term, start, end){
               var samples = [];
               var day = 24*60*60*1000;
               var days = [twitter.getCachedTweetsFromDate(start), 
                   twitter.getCachedTweetsFromDate(start - day)];

               var date = start - day;
               while(date > end){
                 days.push(twitter.getCachedTweetsFromDate(date));
                 date -= day;
               }

               Q.all(days)
                 .then(function(bundles){
                 });

             }
}

module.exports = sampler;
