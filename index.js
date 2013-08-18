var express = require("express");
var http = require("http");
var app = express();

var port = process.env.PORT || 8080;

// Set the public directory to /public
app.use(express.static(__dirname + '/public'));

app.listen(port, function() {
	console.log('Server listening on port ' + port);
});


app.get("*", function(request, response) {
  response.writeHead(404, { "Content-Type": "text/plain" });
  response.end("404!");
});