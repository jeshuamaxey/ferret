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

    it('should get tweets from five days ago', function(done){
      var day = new Date(Date.now() - 5*24*60*60*1000);
      twitter.getCachedTweetsFromDate('twitter', day.getTime(), 1)
        .then(function(tweets){
          var statuses = tweets;
          statuses.length.should.be.above(0);
          for(var t in statuses){
            var tweetDate = new Date(statuses[t].created_at);
            tweetDate.getDate().should.equal(day.getDate());
            tweetDate.getMonth().should.equal(day.getMonth());
            tweetDate.getFullYear().should.equal(day.getFullYear());
          }
        }).then(done).fail(done);
    });

    it('should cache what we have just seen', function(done){
      var day = new Date(Date.now() - 5*24*60*60*1000);
      var dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
      twitter.getCachedTweetsFromDate('twitter', day.getTime(), 1)
        .then(function(tweets){
          var statuses = tweets;
          statuses.length.should.be.above(0);
          for(var t in statuses){
            //silly check
            statuses[t].should.have.property('lptime')
              .which.is.greaterThan(dayStart)
              .and.is.lessThan(dayStart + 24*60*60*1000);
          }
        }).then(done).fail(done);
    });

  });


  describe('#getCachedTweetsFromSample', function(){

    it('should cache what we have just seen', function(done){
      var day = new Date(Date.now() - 5*24*60*60*1000);
      var dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
      twitter.getCachedTweetsFromDate('twitter', day.getTime(), 1)
        .then(function(tweets){
          var statuses = tweets;
          statuses.length.should.be.above(0);
          for(var t in statuses){
            //silly check
            statuses[t].should.have.property('lptime')
              .which.is.greaterThan(dayStart)
              .and.is.lessThan(dayStart + 24*60*60*1000);
          }
        }).then(done).fail(done);
    });

  }
});
