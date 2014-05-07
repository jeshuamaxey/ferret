'use strict';

//global namespace object
var g = g || {};

// set to true to fake the api call
g.fakeApiCall = true

Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
  };

g.main = function() {
	$('body').addClass('landing');
	$('#seeTweets').hide();
	$("#initial-search").on('submit', g.initRefine);
	$("#seeTweets").on('click', g.initRetrieve);
}

g.initRefine = function(e) {
	//stop default form submission
	e.preventDefault();
	//change view state
	$('body').removeClass('landing').addClass('refine');

	//add filter event listener
	$('#filterParameters li').on('click', function() {
		$('#filterParameters li').removeClass('active');
		$(this).addClass('active');
	});
	//
	g.graphAJAX();		
}

g.initRetrieve = function() {
	$('body').removeClass('refine').addClass('retrieve');

	g.tweetsAJAX();
}

g.graphAJAX = function(e) {
	//clear any previous graphs (this should be improved I guess)
	$('#graph').html('');
	//show loading gif cos the api call takes a while
	$('#loadingGif').show()
	//get parameters from form
	var hashtag = $('#hashtag').val();
	var date = $('#date').val();
	////'http://localhost:3000/api/generate_time_series/'+ hashtag + '/' + date;
	var url = g.fakeApiCall ? null : 'http://localhost:3000/api/generate/'+ hashtag;
	//make the call
	$.ajax({
		url: url,
		type: 'GET'
	})
	.done(g.presentGraph)
	.fail(g.failedAjax);
};

g.presentGraph = function(filename) {
	if(g.fakeApiCall) filename = 'data.tsv';
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
		console.log(t)
		//scan tweet for media
		//make tweet

		$('#tweets').append("<li class='media tweet' data-index="+i+">" +
														"<a class='pull-left' href='#'>" +
															"<img class='twProfilePic' src='"+ t.user.profile_image_url +"'/>" +
												    "</a>" +
												    "<div class='media-body'>" +
												      "<h4 class='media-heading'><a src='"+ t.user.profile_image_url +"'>" +
												      	t.user.name +
												      "</a></h4>" +
												      "<div class='tweet-content'>" +
																"<p>" + t.text + "</p>" +
																"<img class='tweetPic' src='"+ t.entities.media[0].media_url +"'/>" +
															"</div>" +
															"<div class='tweet-footer'>" +
																"<a href='https://twitter.com/l/statuses/" + t.id_str + "' target='_blank'>Go to Tweet</a>" +
															"</div>" +
												"</li>");
	})
}

$(document).ready(g.main);
