var vows = require('vows');
var assert = require('assert');

var twitter = require('./data/twitter');

var suite = vows.describe('twitter');

suite.addBatch({
  'getting data' : {
    'connecting': {
      topic : twitter.twitter,
      
      'can read twitterapi.json': function(topic){
        assert.isObject(topic.key);
        assert.isString(topic.key.key);
        assert.isString(topic.key.keySecret);
        assert.isString(topic.key.token);
        assert.isString(topic.key.tokenSecret);
      }
    }
  }

});

suite.run();
