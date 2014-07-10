var should = require('should')
var series = require('../data/series');
require('../data/mdb').clear();

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
        var seen = [];
        var lastdate = Number.MAX_VALUE;
        for (var s in series){
          series[s].date.should.be.ok;
          series[s].date.should.be.lessThan(start/100);
          series[s].date.should.be.greaterThan(end/100);
          series[s].date.should.be.lessThan(lastdate);
          lastdate = series[s].date;

          series[s].tps.should.be.ok;
          (series[s].tps >= 0).should.be.true;
          (series[s].tps <= 15).should.be.true; //should this be here?

          seen.should.not.containEql(series[s]);
          seen.push(series[s])
        }
      }).then(done).fail(done);
    });

    it('should cache well', function(done){
      //setTimeout(function(){(false).should.be.true;}, 1000);//generous
      var start = Date.now();
      var scale = 5*24*60*60*1000;
      var end = Date.now() - scale;
      var term = 'neymar';
      series.getSeriesFromSamples(term, start, end)
      .then(function(series){
        series.length.should.be.greaterThan(7);
        var seen = [];
        for (var s in series){
          series[s].date.should.be.ok;
          series[s].date.should.be.lessThan(start/100);
          series[s].date.should.be.greaterThan(end/100);

          series[s].tps.should.be.ok;
          (series[s].tps >= 0).should.be.true;
          (series[s].tps <= 15).should.be.true; //should this be here?

          seen.should.not.containEql(series[s]);
          seen.push(series[s])
        }
      }).then(done).fail(done);
    });

  });

});
