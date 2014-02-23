'use strict';

//global namespace object
var g = g || {};

var apikey = 'CcdZ3PrZxZb7m7uQhfCAxg';

g.main = function() {
	$('#seeTweets').hide();
	$("#submitParams").on('click', g.graphAJAX);
	$("#seeTweets").on('click', g.tweetsAJAX);
}

g.graphAJAX = function(e){
	e.preventDefault();
	var hashtag = $('#hashtag').val();
	var date = $('#date').val();

	$.ajax({
		url: 'http://localhost:5000/api/get_time_series/'+ hashtag + '/' + date,
		type: 'GET'
	}).done(function(filename) {
		console.log(filename)
		g.plotGraph(filename);
		//$('#seeTweets').show();
	});

};

g.tweetsAJAX = function() {
	$.ajax({
		//url: 'api/get_tweets/' + startDate + '/' + endDate,
		type: 'GET'
	})
	.done(g.addTweets)
}

g.addTweets = function(tweets) {
	tweets.forEach(function(t) {
		$('#tweets').append(t.html);
	})
}

$(document).ready(g.main);