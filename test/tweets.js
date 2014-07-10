var should = require('should')
var Q = require('q')
var twitter = require('../data/twitter');

describe('twitter', function(){

  /*
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

    it('should retrieve from the cache what we have just seen', function(done){
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

  describe('#getTweetsFromId', function(){

    it('should get ids that are monotonic increasing with time', function(done){
      var today = Date.now();
      var day = today - 5*24*60*60*1000;
      var middleDate = (today + day)/2;
      Q.all([
        twitter.getCachedTweetsFromDate('twitter', today, 1),
        twitter.getCachedTweetsFromDate('twitter', day, 1),
        ])
        .then(function(dateTweets){
          var middleId = (dateTweets[0][0].id + dateTweets[1][0].id) / 2;
          return twitter.getCachedTweetsFromId('twitter', middleId);
        })
        .then(function(tweets){
          var statuses = tweets;
          statuses.length.should.be.above(0);
          for(var t in statuses){
            var tweetDate = new Date(statuses[t].created_at);
            //sensible
            tweetDate.getTime().should.be
              .greaterThan(day)
              .and.lessThan(today);
          }
        }).then(done).fail(done);
    });

  });

  describe('#getTweetsBetweenTimes', function(){

    it('should get all tweets between times', function(done){
      var day = Date.now() - 5*24*60*60*1000;
      var start = 4;
      var end = 13;
      return twitter.getCachedTweetsFromDate('twitter', day, 1)
        .then(function(testTweets){
            return twitter.getTweetsBetweenTimes(
              'twitter',
              testTweets[start].lptime,
              testTweets[end].lptime)
              .then(function(tweets){
                var i = 0;
                for(var j = start; j < end; j++){
                  tweets[i].should.have.property('id')
                    .which.is.equal(testTweets[j].id);
                  i++;
                }
              });
        }).then(done).fail(done);
    });
  });
  */

});
