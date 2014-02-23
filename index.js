var express = require("express");
var http = require("http");
var app = express();

var port = process.env.PORT || 8080;

// Set the public directory to /public
app.use(express.static(__dirname + '/public'));
//for parsing the POSTs in the API
app.use(express.urlencoded());

app.listen(port, function() {
	console.log('Server listening on port ' + port);
});

//API
app.post('/api/update', function(req, res) {
	req.setEncoding("utf8");
	var update = req.body;
	console.log(update)
});

app.get('/api/get_tweets', function(req, res) {
	console.log('getting tweets');
	res.send({hello: 'world'});
});

//keep last
app.get("*", function(request, response) {
  response.writeHead(404, { "Content-Type": "text/plain" });
  response.end("404!");
});