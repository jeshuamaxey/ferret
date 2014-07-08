var should = require('should')
var series = require('../data/series');

describe('series', function(){

  describe('#getSeries', function(){

    it('should return a sensible series', function(done){
      var start = Date.now();
      var scale = 5*24*60*60*1000;
      var end = Date.now() - scale;
      var term = 'neymar';
      series.getSeriesFromSamples(term, start, end)
      .then(function(series){
        series.length.should.be.greaterThan(7);
        //series[0].time.should.be.greaterThan(start - scale/100);
        //new Date(series[series.length - 1].time).getDate().should.equal(new Date(end).getDate());
        for (var s in series){
          series[s].time.should.be.lessThan(start);
          series[s].time.should.be.greaterThan(end - scale/4); //we can't be too far off
          series[s].time.should.be.ok;
          series[s].minid.should.be.ok;
          series[s].maxid.should.be.ok;
          (series[s].mintime <= series[s].maxtime).should.be.true;
        }
      }).then(done).fail(done);
    });

  });

});
