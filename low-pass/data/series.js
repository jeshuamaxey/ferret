var twitter = require('./twitter');

var sampler = {
  getSample: function(term, time, cb){
               twitter.getTweetsFromDate(term, time, makeSample);
             }
}

module.exports = sampler;
