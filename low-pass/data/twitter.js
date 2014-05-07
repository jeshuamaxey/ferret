var fs = require('fs');
var path = require('path');
var Twit = require('twit');

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

  getTweets: function(search, date, pages, cb){
    var tweets = [];
    var api = this.T;

    var adder = function (err, data, res){
      //lots of copying
      tweets = tweets.concat(data.statuses);
      pages = pages - 1;

      if (pages == 0){
        cb(err, tweets);
      } else {
        var maxid = data.search_metadata.sinceid;
        api.get('search/tweets', { q: search, max_id: maxid }, adder);
      }
    };

    api.get('search/tweets', { q: search }, adder);

  },

  getSample: function(term, time, callback){
               var sample = {
                 term: term, 
                 time: 0,
                 minid: 0,
                 maxid: 0,
                 density: 0
               }
               callback(null, sample);
             }

};

exports.twitter = twitter;
