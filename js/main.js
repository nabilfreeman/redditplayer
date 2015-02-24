var subarray = [];
var numberOfSubreddits;

function getList(){
	$("#urls li").remove();
	$("<li class='initial'>Loading...</li>").appendTo("#urls");
	subarray = [];
	numberOfSubreddits = $("#subreddits li").length - 1;
	$.each($("#subreddits li"), function(){
		if($(this).html()!="Press enter to add subreddits."){
			$.ajax({
			  url: "http://www.reddit.com/r/" + $(this).html().replace("<div></div>", "").replace("/r/","") + "/hot/.json?jsonp=?",
			  dataType: 'json',
			  async: false,
			  data: {},
			  success: function(data) {
			    subarray.push(data.data);
			    populateURLs();
			  }
			});
		}
	});
}

function populateURLs(){
	if(subarray.length==numberOfSubreddits){

		var iterateLength = 0;
		
		$.each(subarray, function(i, value){
			if(value.children.length > iterateLength){
				iterateLength = value.children.length;
			}
		});

		$(".initial").remove();

		for(var i=0;i<iterateLength;i++){
			$.each(subarray, function(iterator, value){

				if(value.children[i]!=undefined){
					var urlstr = value.children[i].data.url;
					
					if(urlstr.indexOf("youtu")>0){
						var regex = new RegExp(".*(?:youtu.be\\\/|v\\\/|u\/\\w\/|embed\\\/|watch\\?.*&?v=)");
						var array = regex.exec(urlstr);

						var videoid = urlstr.replace(array[0],"");

						var n = videoid.indexOf('&');
						videoid = videoid.substring(0, n != -1 ? n : videoid.length);

						var url = $("<li data-subreddit='" + value.children[i].data.subreddit + "' data-type='youtube' data-url='" + videoid + "' data-originalurl='" + urlstr + "' data-permalink='http://reddit.com" + value.children[i].data.permalink + "'></li>").html(value.children[i].data.title);

						//url.addClass("red");
						url.hide().appendTo("#urls").fadeIn(100);
					} else if(urlstr.indexOf("soundcloud")>0){
						var url = $("<li data-subreddit='" + value.children[i].data.subreddit + "' data-type='soundcloud' data-url='" + urlstr.replace("https", "http") + "' data-originalurl='" + urlstr.replace("https", "http") + "' data-permalink='http://reddit.com" + value.children[i].data.permalink + "'></li>").html(value.children[i].data.title);

						//url.addClass("orange");
						url.hide().appendTo("#urls").fadeIn(100);

					}
				}

			});
		}

		var urllist = "";
		$("#urls li").each(function(){
			var url = $(this).attr("data-url");
			if(url.indexOf("soundcloud")==-1){
				url = "http://youtu.be/" + url;
			}
			urllist = urllist + url + "\n";
		})

	}
}

var sliding = false;
$("#progress").slider({
	min: 0,
	max: 100,
	step: 1,
	animate: 600,
	start: function( event, ui) {
		sliding = true;
	},
	stop: function( event, ui) {
		sliding = false;
		seekTo(ui.value);
	}
});

$(".ui-slider-handle").attr("data-content", "00:00");

var currentItem;
var currentCommentsLink;
var currentSourceLink;

$("#viewcomments").live('click', function(){
	window.open(currentCommentsLink,'_newtab');
});
$("#originallink").live('click', function(){
	window.open(currentSourceLink,'_newtab');
	if(currentItem.attr("data-type")=="youtube"){
		$("#playpause").click();
	}
});

$("#urls").on('click', 'li', function(){
	if(!$(this).hasClass("separator")){
		if(!$(this).hasClass("playing")){

			$("#intro").fadeOut(100);
			$("#meta").fadeIn(400);
			$("#footer").fadeIn(400);
			$(".nowplaying").html($(this).html());
			currentCommentsLink = $(this).attr("data-permalink");
			currentSourceLink = $(this).attr("data-originalurl");
			$(".subreddit").html("listening to /r/" + $(this).attr("data-subreddit"));
			$("#urls li").removeClass("playing");
			$(this).addClass("playing");
			$("#progress").slider('option', 'value', 0);



			if($(this).attr("data-type")=="youtube"){

				if(currentItem&&currentItem.attr("data-type")=="soundcloud"){
					splayer.api_stop();
				}

				player.loadVideoById($(this).attr("data-url"));
				$("#soundcloud").css('opacity', '0');
				$("#soundcloudmeta").css('opacity', '0');
				$("#player").css('opacity', '1');

				$("#originallink").html("Go to original YouTube link");

			} else if($(this).attr("data-type")=="soundcloud"){
				
				if(currentItem&&currentItem.attr("data-type")=="youtube"){
					player.stopVideo();
				}

				loadSoundCloudUrl($(this).attr("data-url"));
				$("#player").css('opacity', '0');
				$("#soundcloud").css('opacity', '1');
				$("#soundcloudmeta").css('opacity', '1');

				$("#originallink").html("Go to original SoundCloud link");

			}



			$("#playpause").addClass("pausebutton");
			$("#playpause").removeClass("playbutton");
			currentItem = $(this);
		}
	}
});

$(".sunken").on('click', '#playpause', function(){
	if(!currentItem){
		$("#urls").children(":first").click();
	} else {
		if(currentItem.attr("data-type")=="youtube"){
			switch(player.getPlayerState()){
				case 1:
					player.pauseVideo();
					$("#playpause").removeClass("pausebutton");
					$("#playpause").addClass("playbutton");
					break;
				case 2:
					player.playVideo();
					$("#playpause").addClass("pausebutton");
					$("#playpause").removeClass("playbutton");
					break;
			}
		} else if(currentItem.attr("data-type")=="soundcloud"){
			if($("#playpause").hasClass("pausebutton")){
				splayer.api_pause();
				$("#playpause").removeClass("pausebutton");
				$("#playpause").addClass("playbutton");
			} else {
				splayer.api_play();
				$("#playpause").addClass("pausebutton");
				$("#playpause").removeClass("playbutton");
			}
		}
	}
	
});

$(".sunken").on('click', '#rewind', function(){
	currentItem.prev().click();
})

$(".sunken").on('click', '#ffwd', function(){
	currentItem.next().click();
})

$("#subredditholder input").focusin(function() {
	$("#subreddits").fadeIn(100);
});

$(document).on('click', 'body', function(){
	if ($('#subreddits').is(':hover') || $("#subredditholder input").is(':hover')) {
    } else {
    	$("#subreddits").fadeOut(100);
    }
});

$("#subreddits").on('click', 'div', function(){
	if($("#subreddits li").length==2){
		$(".greysub").fadeIn(100);
	}
	$(this).parent().slideUp(100, function(){
		$(this).remove();
		if($("#subreddits li").length==1){
			$("#refresh").attr("disabled", "disabled");
		}
	})
});

$(".sunken").on('click', '#refresh', function(){
	getList();
});

function addSubreddit(){
	var subreddit = $(".sunken input").val();
	subreddit = "/r/" + subreddit.replace("/r/", "").replace(" ", "");
	var match = false;
	$.each($("#subreddits li"), function(){
		if($(this).html()==subreddit+"<div></div>" || subreddit=="/r/"){
			match = true;
		}
	});
	if(match==false){
		$('<li>' + subreddit + '<div></div></li>').hide().prependTo("#subreddits").slideDown(100);
		$("#refresh").removeAttr("disabled");
		$(".greysub").fadeOut(400);
		$(".sunken input").val("/r/");
	}
}

$(".sunken input").keypress(function (e) {
    if(e.keyCode == 13){
		addSubreddit();
	}
});

$("body").keypress(function (e) {
	if(!$(".sunken input").is(":focus")){
	    if(e.keyCode == 32){
			$("#playpause").click();
		}
		if(e.keyCode == 44){
			$("#rewind").click();
		}
		if(e.keyCode == 46){
			$("#ffwd").click();
		}

	}
});

var videoLength;
var i;

function ytStateChange(event){
	clearInterval(i);
	if(event.data === 0) {          
        $("#ffwd").click();
    }
    if(event.data === 1) {
    	videoLength = player.getDuration();
    	setTotalTime(videoLength);
    	i = setInterval(checkProgress, 1000); //check status
    }
}

function setTotalTime(seconds){
	var date = new Date(null);
	date.setSeconds(seconds);
	var time = date.toTimeString().substr(0, 8);

	if(time.substr(0,2)=="00"){
		time = time.substr(3, time.length);
	}

	$("#totaltime").html(time);
	/*
	if(seconds>3600){
		$("#totaltime").html(Math.floor(seconds/60) + ":" + Math.floor(seconds%60));
	} else {
		$("#totaltime").html(Math.floor(seconds/60) + ":" + Math.floor(seconds%60));
	}*/
	
}

function setElapsedTime(seconds){
	var date = new Date(null);
	date.setSeconds(seconds);
	var time = date.toTimeString().substr(0, 8);

	if(time.substr(0,2)=="00"){
		time = time.substr(3, time.length);
	}

	$(".ui-slider-handle").attr("data-content", time);
}

function checkProgress(){
	var currentTime;
	if(currentItem.attr("data-type")=="youtube"){
		currentTime = player.getCurrentTime();
	} else if(currentItem.attr("data-type")=="soundcloud"){
		currentTime = splayer.api_getTrackPosition();
	}
	setElapsedTime(currentTime);
    var c = (currentTime/videoLength)*100;
    c = Math.round(c);
    if(!sliding){
    	$("#progress").slider('option', 'value', c);
    }
}

function seekTo(percentage){
	var timeToSeek = (videoLength/100)*percentage;
	var currentTime;
	if(currentItem.attr("data-type")=="youtube"){
		player.seekTo(timeToSeek, true);
		currentTime = player.getCurrentTime();
	} else if(currentItem.attr("data-type")=="soundcloud"){
		splayer.api_seekTo(timeToSeek);
		currentTime = splayer.api_getTrackPosition();
	}

	setElapsedTime(currentTime);
}

function loadSoundCloudUrl(path){
	$.ajax({
	  type: "POST",
	  url: "/gethtml",
	  data: { url: path }
	}).done(function( msg ) {
		var doc = $(msg.htmlData);
	  	$("#soundcloudmeta").css("background-image", "url('" + doc.find(".artwork").attr("style").replace("background:url(", "").replace(")", "").replace("large.jpg", "t500x500.jpg") + "')");
	});


	var flashvars = {
	  enable_api: true, 
	  object_id: "myPlayer",
	  url: path
	};
	var params = {
	  allowscriptaccess: "always",
	  show_artwork: true
	};
	var attributes = {
	  id: "soundcloud",
	  name: "soundcloud"
	};
	swfobject.embedSWF("http://player.soundcloud.com/player.swf", "soundcloud", "100%", "81", "9.0.0","expressInstall.swf", flashvars, params, attributes);
}

soundcloud.addEventListener('onPlayerReady', function(player, data) {
    splayer = soundcloud.getPlayer('soundcloud');
    clearInterval(i);
    splayer.api_play();
});

soundcloud.addEventListener('onMediaPlay', function(player, data) {
   	videoLength = splayer.api_getTrackDuration();
   	setTotalTime(videoLength);
   	i = setInterval(checkProgress, 1000);
});

soundcloud.addEventListener('onMediaEnd', function(player, data) {
  	$("#ffwd").click();
});