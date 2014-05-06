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
	//stop default form submission
	e.preventDefault();
	//clear any previous graphs (this should be improved I guess)
	$('#graph').html('');
	//show loading gif cos the api call takes a while
	$('#loadingGif').show()
	//get parameters from form
	var hashtag = $('#hashtag').val();
	var date = $('#date').val();
	var url = null; //'http://localhost:3000/api/generate_time_series/'+ hashtag + '/' + date;
	//make the call
	$.ajax({
		url: url,
		type: 'GET'
	})
	.done(g.presentGraph)
	.fail(g.failedAjax);
};

g.presentGraph = function(filename) {
	$('#loadingGif').hide();
	g.plotGraph(filename);
	//show option to see tweets
	$('#seeTweets').show();
}

g.tweetsAJAX = function() {
	//console.log(g.dateRange);
	//var url = 'http://localhost:5000/api/get_tweets/' + g.dateRange[0].yyyymmdd() + '/' + g.dateRange[1].yyyymmdd();
	//hack to local data for test
	var url = 'testData.json';
	$.ajax({
		url: url,
		type: 'GET'
	})
	.done(g.addTweets)
}

g.failedAjax = function() {
	console.log('ajax failed')
}

g.addTweets = function(tweets) {
	//if there are no tweets, tell the console
	if(!tweets.length) {
		console.log("No tweets returned");
		return false;
	}
	//tweets = $.parseJSON(tweets)
	tweets.forEach(function(t, i) {
		console.log(t.coordinates, i)
		$('#tweets').append("<li class='list-group-item' data-index="+i+">" +
													"<h4 class='list-group-item-heading'>"+
														"<a href='https://twitter.com/" + t.user.name + "' target='_blank'>" +
															t.user.name +
														"</a>" +
													"</h4>" +
													"<p>" + t.text + "</p>" +
													"<a href='https://twitter.com/l/statuses/" + t.id_str + "' target='_blank'>Go to Tweet</a>" +
												"</li>");
	})
}

$(document).ready(g.main);