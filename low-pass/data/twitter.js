var fs = require('fs');
var path = require('path');
var Twit = require('twit');
var samplesize = 15;
var db = require('./mdb');

var twitter = {
  
  _T: null, 

  get key() {
    var file = path.join (__dirname, 'twitterapi.json');
    var data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  },

  get T() {
    if (!this._T){
      this._T = new Twit({
            consumer_key: this.key.key,
            consumer_secret: this.key.keySecret,
            access_token: this.key.token,
            access_token_secret: this.key.tokenSecret
          });

    }
    return this._T;
  },

  getTweets: function(search, time, n, id, cb){

               var api = this.T;

               var pullTweets = function(){
                 var tweets = [];

                 var pages = Math.ceil(n / 15);
                 console.log('getting ' + pages + ' pages');

                 if(!time){
                   time = Date.now();
                 }

                 var d = new Date(time);
                 var ds = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                 var query = { q: search, until: ds, result_type: 'recent'};

                 if(id){
                   query.max_id = id;
                 }

                 var adder = function (err, data, res){
                   //lots of copying
                   tweets = tweets.concat(data.statuses);
                   pages = pages - 1;

                   if(err){
                     cb(err);
                   }

                   if (pages <= 0){
                     cb(err, tweets);
                   } else {
                     var maxid = data.search_metadata.sinceid;
                     query.max_id = maxid;
                     api.get('search/tweets', query, adder);
                   }
                 };

                 api.get('search/tweets', query, adder);
               };

               db.haveTweets(search, time, function(err, docs){
                 if(err){
                   pullTweets(api);
                 } else {
                   cb(null, docs);
                 }
               });

             },

  getSample: function(term, time, id, callback){

               var useTweets = function (err, tweets){
                 if (err){
                   callback(err);
                   return;
                 }

                 var avgTime = time;
                 var density = 0;
                 var minid = 0;
                 var maxid = 0;

                 if (tweets.length < 4){
                   console.log('not enough tweets');
                 } else {
                   var mintime = Number.MAX_VALUE;
                   var maxtime = Number.MIN_VALUE;
                   var sum = 0;
                   for(var t in tweets){
                     var itime = 0;
                     itime = new Date(tweets[t].created_at).getTime();
                     mintime = Math.min(mintime, itime);
                     maxtime = Math.max(maxtime, itime);
                     sum = sum + itime;
                   }

                   avgTime = (maxtime + mintime) / 2;

                   if (maxtime == mintime){
                     console.log('sample size too small');
                     density = samplesize;
                   } else {
                     density = samplesize / (maxtime - mintime);
                   }

                   minid = tweets[0].id;
                   maxid = tweets[tweets.length - 1].id;
                 }
                 
                 var sample = {
                   term: term,
                   time: avgTime,
                   minid: minid,
                   maxid: maxid,
                   density: density
                 };
                 db.storeSample(sample, tweets);
                 callback(null, sample);
               };

               var me = this;//javascript why
               db.haveSample(term, time, function(err, sample){
                 if (!sample){
                   console.log('getting sample');
                   me.getTweets(term, time, samplesize, id, useTweets);
                 } else {
                   callback(null, sample);
                 }
               });
             },

  sampleTerm: function(term, scale, cb){
                 //scale is milliseconds
                 var me = this;

                 //could be changed 
                 var start = Date.now();

                 var closestReference = function(point, reference){
                   var r = 1;
                   var distance = point.time - reference[0].time;
                   while (r < reference.length){
                     var newdistance = point.time - reference[r].time;
                     if (newdistance > distance){
                       break;
                     }
                     r++;
                   }
                   return reference[r-1]
                 }

                 var idgradient = function(start, end){
                   
                   var startid = (start.maxid + start.minid) / 2;
                   var endid = (end.maxid + end.minid) / 2;
                   did = startid - endid;
                   dtime = start.time - end.time;
                   return did/dtime;

                 }

                 var getTimeScale = function(reference){
                   reference.sort(function(a,b){
                     if(a.time < b.time){
                       return -1;
                     }
                     if(a.time > b.time){
                       return 1;
                     }
                     return 0;
                   });

                   var nref = reference.length;
                   var startref = reference[0];
                   var endref = reference[nref - 1];
                   var gradient = idgradient(startref, endref);
                   for (var ref = 0; ref < nref - 1; ref++){
                     reference[ref].gradient = idgradient(reference[ref], reference[ref + 1]);
                   }
                   reference[nref-1].gradient = reference[nref-2].gradient;
                   
                   var npoints = 10
                   var points = [];
                   var toAdd = npoints;
                   for(var p = 0; p < npoints; p++){
                     var point = {time: start + p*scale/npoints};
                     var ref = closestReference(point, reference);
                     var refid = (ref.maxid + ref.minid)/2;
                     var deltaid = ref.gradient*(ref.time - point.time);
                     var id = Math.round(refid + deltaid);
                     me.getSample(ref.term, null, id, function(err, s){
                       point.density = s.density;
                       points.push(point);
                       toAdd--;
                       if (!toAdd){
                         cb(null, points);
                       }
                     });
                   }
                 }

                 var samplesToPoints = function(samples, cb){
                   var points = [];
                   for (s in samples){
                     points.push({date: samples[s].time, tps: samples[s].density});
                   }
                   cb(null, points);
                 }

                 //get some reference samples
                 db.getSamples(term, function(err, samples){
                   //TODO: remove redundant sample
                   if (samples.length < 2){
                     var date = new Date();
                     me.getSample(term, date.getTime(), null, function(err, today){
                       date.setDate(date.getDate() - 1);
                       me.getSample(term, date.getTime(), null, function(err, yesterday){
                         samples.push(today);
                         samples.push(yesterday);
                         samplesToPoints(samples, cb);
                       });
                     });
                   } else {
                     samplesToPoints(samples, cb);
                   }
                 });
               }

};

module.exports = twitter;
