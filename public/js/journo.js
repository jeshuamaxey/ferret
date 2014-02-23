var j = j || {};

j.main = function() {
	//event listeners
	$('#post-update').on('click', j.postUpdate)
}

//
j.postUpdate = function(e) {
	e.preventDefault();
	//gather the info
	var data = {
		copy: $('#post-copy').val()
	}
	//make the call
	$.ajax({
		type: 'POST',
		url: 'api/update',
		data: data
	}).done(function(){
		console.log('DONE')
	})
}

//
j.getTweets = function() {
	$.ajax({
		type: 'GET',
		url: 'api/get_tweets'
	}).done(function(data) {
		console.log(data)
		data.forEach(function(t) {
			$('#tweet-list').append('<a href="#" class="list-group-item">' +
									'<h4 class="list-group-item-heading">'+ t.username +'<button class="btn btn-xs btn-danger">Dismiss</button> <button class="btn btn-xs btn-success">Post</button> </h4>' +
                  '<p class="list-group-item-text">'+ t.content +'</p>' +
                  '<p>RT: <span class="rt">'+ t.rt +'</span> FAV:<span class="fav">'+ t.fav +'</span> </p>' +
                '</a>');
		});
	})
}

//must go last
$(document).ready(j.main); 