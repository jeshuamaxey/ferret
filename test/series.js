var should = require('should')
var series = require('../data/series');

describe('series', function(){

  describe('#getSeries', function(){

    it('should return a series with a good range', function(done){
      var start = Date.now();
      var scale = 5*24*60*60*1000;
      var end = Date.now() - scale;
      var term = 'neymar';
      series.getSeries(term, start, end)
      .then(function(series){
        series.should.have.lengthOf(10);
        series[0].date.should.be.greaterThan(start - scale/100);
        series[series.length - 1].date.should.be.lessThan(end + scale/100);
      });
    });

  });

});
