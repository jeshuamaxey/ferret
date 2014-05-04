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
    //TODO: pages
    this.T.get('search/tweets', { q: search }, function(err, data, res){
      //lots of copying
      cb(err, data.statuses);
    });
  }


};

exports.twitter = twitter;
