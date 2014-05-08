'use strict';

//global namespace object
var g = g || {};

// set to true to fake the api call
g.fakeApiCall = false;

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
	$("#navbar-search").on('submit', g.initRefine);
	$("#seeTweets").on('click', g.initRetrieve);
}

g.initRefine = function(e) {
	//stop default form submission
	e.preventDefault();
	//collect search term
	g.searchTerm = $('#hashtag').val();
	$('nav input').val(g.searchTerm);
	//animate UI
	$('.l-initial-search').fadeOut(200, function() {
		//update css state classes
		$('body').removeClass('landing')
		$('.l-refine-search').fadeIn(200, function() {
			g.generateGraph(g.searchTerm);
			$('body').addClass('refine');
		});
	});	
}

g.initRetrieve = function() {
	//get tweets
	g.tweetsAJAX(g.searchTerm);
	//animate UI
	$('.l-refine-search').fadeOut(200, function() {
		//update css state classes
		$('body').removeClass('refine');
		$('l.retrieve').fadeIn(200, function() {
			$('body').addClass('retrieve');
		});
	});
}

g.generateGraph = function(searchTerm) {
	//clear any previous graphs (this should be improved I guess)
	$('#graph').html('');
	//show loading gif cos the api call takes a while
	$('#loadingGif').show();
	////'http://localhost:3000/api/generate_time_series/'+ hashtag + '/' + date;
	//var url = g.fakeApiCall ? null : 'http://localhost:3000/api/search?q='+ searchTerm;
	var url = g.fakeApiCall ? null : 'api/search?q='+ searchTerm;
  g.presentGraph(url);
  /*
	//make the call
	$.ajax({
		url: url,
		type: 'GET'
	})
	.done(g.presentGraph)
	.fail(g.failedAjax);
  */
};

g.presentGraph = function(filename) {
	if(g.fakeApiCall) filename = 'testseries.json';
	$('#loadingGif').hide();
	g.plotGraph(filename);
	//show option to see tweets
	$('#seeTweets').show();
}

g.tweetsAJAX = function() {
	 console.log(g.dateRange);
	 var url = 'api/select?'+
            'term=' + g.searchTerm + 
	 					'start=' + g.dateRange[0] +
	 					'&end='+ g.dateRange[1];
	//hack to local data for test
	//var url = 'testData.json';
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

		// $('#tweets').append("<li class='media tweet' data-index="+i+">" +
		// 												"<a class='pull-left' href='#'>" +
		// 													"<img class='twProfilePic' src='"+ t.user.profile_image_url +"'/>" +
		// 										    "</a>" +
		// 										    "<div class='media-body'>" +
		// 										      "<h4 class='media-heading'><a src='"+ t.user.profile_image_url +"'>" +
		// 										      	t.user.name +
		// 										      "</a></h4>" +
		// 										      "<div class='tweet-content'>" +
		// 														"<p>" + t.text + "</p>" +
		// 														"<img class='tweetPic' src='"+ t.entities.media[0].media_url +"'/>" +
		// 													"</div>" +
		// 													"<div class='tweet-footer'>" +
		// 														"<a href='https://twitter.com/l/statuses/" + t.id_str + "' target='_blank'>Go to Tweet</a>" +
		// 													"</div>" +
		// 										"</li>");

		$('#tweets').append("<div class='tweet'>" +
													"<div class='row tw-body'>" +
														"<div class='col-md-4 tw-profile'>" +
															"<img class='twProfilePic' src='"+ t.user.profile_image_url +"' >" +
															"<p>" +
																"<strong class='tw-username'>"+ t.user.name +"</strong>" +
																"<br>" +
																"<span>&#64;"+ t.user.screen_name +"</span>" +
															"</p>" +
														"</div>" +
														"<div class='col-md-8 tw-body'>" +
															"<p>" + t.text + "</p>" +
															"<img class='tweetPic' src='"+ t.entities.media[0].media_url +"'/>" +
														"</div>" +
													"</div>" +
													"<div class='row'>" +
														"<div class='col-md-12 tw-footer'></div>" +
													"</div>" +
												"</div>")
	}); //end forEach
}

$(document).ready(g.main);
