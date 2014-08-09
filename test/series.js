var should = require('should')
var series = require('../data/series');
var auth = require('../routes/auth');
require('../data/mdb').clear();

var TERM = 'gaza'

describe('series', function(){

  describe('#getSeries', function(){
    
    it('should return a sensible series', function(done){
      var start = Date.now();
      var scale = 5*24*60*60*1000;
      var end = Date.now() - scale;
      var term = TERM;
      var key = new auth.key().withAppAccess();
      series.getDaySamples(term, start, end, key)
      .then(function(series){
        console.log(series);
        series.length.should.be.greaterThan(7);
        var seen = [];
        var lastdate = Number.MAX_VALUE;
        for (var s in series){
          series[s].date.should.be.ok;
          /*series[s].date.should.be.lessThan(start/100);*/
          /*series[s].date.should.be.greaterThan(end/100);*/
          series[s].date.should.be.lessThan(lastdate);
          lastdate = series[s].date;

          series[s].tps.should.be.ok;
          (series[s].tps >= 0).should.be.true;

          seen.should.not.containEql(series[s]);
          seen.push(series[s])
        }
      }).then(done).fail(function(reason){
        console.log(reason.stack);
        done(reason);
      });
    });

    it('should cache well', function(done){
      //setTimeout(function(){(false).should.be.true;}, 1000);//generous
      var start = Date.now();
      var scale = 5*24*60*60*1000;
      var end = Date.now() - scale;
      var term = TERM;
      var key = new auth.key().withAppAccess();
      series.getDaySamples(term, start, end, key)
      .then(function(series){
        console.log(series);
        series.length.should.be.greaterThan(7);
        var seen = [];
        var lastdate = Number.MAX_VALUE;
        for (var s in series){
          series[s].date.should.be.ok;
          /*series[s].date.should.be.lessThan(start/100);*/
          /*series[s].date.should.be.greaterThan((end - 12*60*60*1000)/100);*/
          series[s].date.should.be.lessThan(lastdate);
          lastdate = series[s].date;

          series[s].tps.should.be.ok;
          (series[s].tps >= 0).should.be.true;

          seen.should.not.containEql(series[s]);
          seen.push(series[s])
        }
      }).then(done).fail(function(reason){
        console.log(reason.stack);
        done(reason);
      });
    });

  });

});
