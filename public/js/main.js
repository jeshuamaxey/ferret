'use strict';

//global namespace object
var g = g || {};

Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
  };

g.main = function() {
	$('#seeTweets').hide();
	$("#submitParams").on('click', g.graphAJAX);
	$("#seeTweets").on('click', g.tweetsAJAX);
}

g.graphAJAX = function(e){
	e.preventDefault();

	$('#loadingGif').show()
	var hashtag = $('#hashtag').val();
	var date = $('#date').val();

	$.ajax({
		url: 'http://localhost:5000/api/generate_time_series/'+ hashtag + '/' + date,
		type: 'GET'
	}).done(function(filename) {
		console.log('filename: '+filename);
		$('#loadingGif').hide();
		g.plotGraph(filename);
		$('#seeTweets').show();
	});

};

g.tweetsAJAX = function() {
	console.log(g.dateRange);
	var url = 'http://localhost:5000/api/get_tweets/' + g.dateRange[0].yyyymmdd() + '/' + g.dateRange[1].yyyymmdd()
	$.ajax({
		url: url,
		type: 'GET'
	})
	.done(g.addTweets)
}

g.addTweets = function(tweets) {
	if(!tweets.length) console.log("No tweets returned");
	tweets = $.parseJSON(tweets)
	tweets.forEach(function(t) {
		console.log(t)
		$('#tweets').append("<li class='list-group-item'><a href='https://twitter.com/l/statuses/" + t.id_str + "' target='_blank'>"+ t.text +"</a></li>");
	})
}

$(document).ready(g.main);