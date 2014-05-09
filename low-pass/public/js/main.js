'use strict';

//global namespace object
var g = g || {};

// set to true to fake the api calls
g.fakeApi = {
	'search': false,
	'select': true
};

var filterOptions = ['all','photos','text','video','links','more'];

Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
  };

g.main = function() {
	$('body').addClass('landing');
	$('#seeTweets').hide();
	$('#initial-search').on('submit', g.initRefine);
	$('#navbar-search').on('submit', function(e) {
		//stop default form submission
		e.preventDefault();
		console.log('nav search')
		//collect search term
		$("#seeTweets").hide();
		g.searchTerm = $('#hashtag').val();
		g.fetchTimeSeries(g.searchTerm);
	});
	$("#seeTweets").on('click', g.initRetrieve);
	$('.filterOption').on('click', g.filterTweets);
}

g.initRefine = function(e) {
	console.log('init refine')
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
			g.fetchTimeSeries(g.searchTerm);
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

g.fetchTimeSeries = function(searchTerm) {
	//clear any previous graphs (this should be improved I guess)
	$('#graph').html('');
	//show loading gif cos the api call takes a while
	$('#loadingGif').show();

	var url = g.fakeApi.search ? 'testseries.json' : 'http://localhost:3000/api/search?q='+ searchTerm;  
	//make the call
	$.ajax({
		url: url,
		type: 'GET'
	})
	.done(g.presentGraph)
	.fail(g.failedAjax);
};

g.presentGraph = function(data) {
	g.plotGraph(data);
	$('#seeTweets').show();
	$('#loadingGif').hide()
}

g.tweetsAJAX = function() {
	var url;
	if(!g.fakeApi.select)
		url = 'api/select?'+'term=' + g.searchTerm + 
	 					'start=' + g.dateRange[0] +
	 					'&end='+ g.dateRange[1];
	 else
	 	url = 'testData.json';
	
	console.log('url: '+url)
	$.ajax({
		url: url,
		type: 'GET'
	})
	.done(g.addTweets)
}

g.failedAjax = function(err) {
	$('#error #cause').html('an ajax error');
	$('#error #log').html(err);
	$('#error').modal('show');
}

g.addTweets = function(tweets) {
	//if there are no tweets, tell the console
	if(!tweets.length) {
		console.log("No tweets returned");
		$('#cause').html();
		$('#log').html(tweets);
		$('#error').modal('show');
		return false;
	}
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	//tweets = $.parseJSON(tweets)
	tweets.forEach(function(t, i) {
		var dateStamp = new Date(t.created_at);
		var dateStr = dateStamp.getDate() + " " + months[dateStamp.getMonth()] + " " + dateStamp.getFullYear();

		console.log(t, dateStr);
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
															"<div class='user'>" +
																"<strong class='tw-username'>"+ t.user.name +"</strong>" +
																"<br>" +
																"<span>&#64;"+ t.user.screen_name +"</span>" +
															"</div>" +
															"<div>" +
																"<span class='tw-time'>" + dateStr + "</span>" +
																"<span class='tw-rt'>RETWEETS "+ t.retweet_count +"</span>" +
																"<span class='tw-fav'>FAVOURITES "+ t.favorite_count +"</span>" +
															"</div>" +
														"</div>" +
														"<div class='col-md-4 tw-text'>" +
															"<p>" + t.text + "</p>" +
														"</div>" +
														"<div class='col-md-4 tw-media'>" +
															"<img class='tweetPic' src='"+ t.entities.media[0].media_url +"'/>" +
														"</div>" +
													"</div>" +
												"</div>")
	}); //end forEach
}

g.filterTweets = function(e) {
	//halt link
	e.preventDefault();
	var $self = $(this);
	$('.filterOption').parent().removeClass('active');
	$self.parent().addClass('active');

	var filterBy = $self.data('filter-by');
	switch(filterBy) {
		case 'all':
			//
			break;
		case 'photos':
			//
			break;
		case 'text':
			//
			break;
		case 'video':
			//
			break;
		case 'links':
			//
			break;
	}
}

$(document).ready(g.main);
