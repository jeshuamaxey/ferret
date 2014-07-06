var should = require('should')
var twitter = require('../data/twitter');

describe('twitter', function(){
  describe('#getCachedTweetsFromDate', function(){
    it('should get tweets from today', function(done){
      var today = new Date();
      twitter.getCachedTweetsFromDate('twitter', Date.now(), 1)
        .then(function(tweets){
          var statuses = tweets;
          statuses.length.should.be.above(0);
          for(var t in statuses){
            var tweetDate = new Date(statuses[t].created_at);
            tweetDate.getDate().should.equal(today.getDate());
            tweetDate.getMonth().should.equal(today.getMonth());
            tweetDate.getFullYear().should.equal(today.getFullYear());
          }
        }).then(done).fail(done);
    });
    //test for caching
  });
});
