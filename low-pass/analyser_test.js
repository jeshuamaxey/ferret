var vows = require('vows');
var assert = require('assert');

var analyser = require('./data/analyser');

var suite = vows.describe('analysis');

var fs = require('fs');
var testData = JSON.parse(fs.readFileSync('testData.json', 'utf8'));

suite.addBatch({
  'analysing data': {
    topic: {analyser: analyser.analyser, data: testData},

    'can get a datapoint from a page': function(topic){
      var point = topic.analyser.getDatapoint(topic.data);
      assert.isNumber(point.density);
      assert.isNumber(point.time);
    }
  }

});

suite.run();
