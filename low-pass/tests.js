var vows = require('vows');
var assert = require('assert');

var twitter = require('./data/twitter');

var suite = vows.describe('twitter');
suite.addBatch({
  'getting data' : {
    'connecting': {
      topic : twitter,
      
      'can read twitterapi.json': function(topic){
        assert.isObject(topic.key);
        assert.isString(topic.key.key);
        assert.isString(topic.key.keySecret);
        assert.isString(topic.key.token);
        assert.isString(topic.key.tokenSecret);
      },

      'can connect to api': function(topic){
        assert.isObject(topic.T);
      },

      'can pull a page of tweets': {
        topic: function () {
                 twitter.twitter.getTweets('twitter', null, 1, this.callback)
               },
        'something is returned' : function (err, tweets) {
          assert.isTrue(tweets.length > 0);
        }
      },

      'can pull several pages of tweets': {
        topic: function () {
                 twitter.getTweets('twitter', null, 3, this.callback)
               },
        'tweets are returned' : function (err, tweets) {
          //TODO: comparison of size of results?
          assert.isTrue(tweets.length > 0);
        }
      }
    },
      /*
    'making a sample': {
      topic: function(){
               twitter.getSample('twitter', Date.now(), this.callback);
             },

      'no error': function (err, sample){
        assert.isNull(err);
      },

      'sample object is well formed': function(err, sample){
        assert.equal(sample.term, 'twitter');
        assert.isNumber(sample.time);
        assert.isNumber(sample.minid);
        assert.isNumber(sample.maxid);
        assert.isNumber(sample.density);
      },

      'which is sensible': function(err, sample){
        assert.equal(sample.term, 'twitter');
        assert.strictEqual(sample.time > 0, true);
        assert.strictEqual(sample.minid > 0, true);
        assert.strictEqual(sample.maxid > 0, true);
        assert.strictEqual(sample.density > 0, true);
      },

      
    }
    */
      'making a series': {
        topic: function(){
                 twitter.sampleTerm('twitter', 60*60000, this.callback);
               },

        'no error': function (err, samples){
          assert.isNull(err);
        },

        'there are many points': function (err, samples){
          assert.isStrictEqual(samples >= 5, true);
        },

      }
  },
});

suite.run();
