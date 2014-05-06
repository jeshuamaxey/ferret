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

  getTweets: function(search, date, pages, min, cb){
    //TODO: date
    var tweets = [];
    var api = this.T;
    var maxid = min;

    var adder = function (err, data, res){
      //lots of copying
      if(err){
         console.log(err);
         return;
      }
      tweets = tweets.concat(data.statuses);
      pages = pages - 1;

      if (pages <= 0){
        cb(err, tweets);
      } else {
        maxid = data.search_metadata.sinceid;
        api.get('search/tweets', { q: search, max_id: maxid }, adder);
      }
    };

    api.get('search/tweets', { q: search }, adder);

  },

};

module.exports = twitter;
