var fs = require('fs');
var path = require('path');

var twitter = {
  
  get key() {
    var file = path.join (__dirname, 'twitterapi.json');
    var data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  }

};

exports.twitter = twitter;
