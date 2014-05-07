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

  getTweets: function(search, time, n, cb){

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

  getSample: function(term, time, callback){

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
                   me.getTweets(term, time, samplesize, useTweets);
                 } else {
                   callback(null, sample);
                 }
               });
             }

};

exports.twitter = twitter;
