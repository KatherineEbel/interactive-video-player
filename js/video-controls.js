$(document).ready(function() {
  "use strict";

  var $video = $("#video");
  var $videoContainer = $(".video-container");
  var $buttonBar = $("#buttonbar");
  var $progress = $("#progress-bar");
  var $playButton = $("#play-pause");
  var $videoTimer = $("#video-timer");
  var $volumeToggle = $("#volume-toggle");
  var $fullScreenToggle = $("#fullscreen-toggle");
  var $textTrack = $("#text-track");
  var capText = [];
  var captions = document.getElementById('caption-text');
  var supportsMp4 = !!document.createElement('video').canPlayType('video/mp4');
  var supportsOgg = !!document.createElement('video').canPlayType('video/ogg');

  // remove default controls if supported
  if (supportsMp4 || supportsOgg) {
    $video.removeAttr('controls');
    $buttonBar.css('display','flex');
    $progress.css('display','block');
  } else {
    console.log("can't play video");
  }

  // sync progress bar max to duration of video
  $video[0].addEventListener('loadedmetadata', function() {
    var duration = $video[0].duration;
    $progress.attr('max', duration);
  });

  // update progress bar with currentTime
  $video[0].addEventListener('timeupdate', function() {
    /*var vid = video.get(0);*/
    $videoTimer.text(timeFormat($video[0].currentTime));
    if (!$progress[0].getAttribute('max')) {
      $progress[0].setAttribute('max', this.duration);
      $progress[0].value = this.currentTime;
    } else {
      $progress[0].value = this.currentTime;
    }
  });

  /*Format timer label for video */
  var timeFormat = function(seconds){
	var m = Math.floor(seconds / 60) < 10 ? '0' + Math.floor(seconds / 60) : Math.floor(seconds / 60);
	var s = Math.floor(seconds - (m * 60)) < 10 ? '0' + Math.floor(seconds - (m * 60)) : Math.floor(seconds - (m * 60));
	return m + ':' + s;
};

  // get track element
  // var videoTrack = document.querySelectorAll("track");
  // for each track element
  // $textTrack[0].addEventListener("load", function() {
  //   var track = this.track;
  //   captions.innerHTML = "";
  //   for (var i = 0; i < track.cues.length; i++) {
  //     var span = document.createElement("span");
  //     var cue = track.cues[i];
  //     if (track.cues[i].id == 1) {
  //       track.cues[i].text.replace('"', '');
  //     }
  //     span.innerHTML += cue.text;
  //     captions.appendChild(span);
  //   }
  //   var firstCue = track.cues[0].text.replace('&nbsp;', '');
  //   console.log($("span:contains('" + firstCue + "')"));
  //   $("span:contains('" + firstCue + "')").addClass('currentCaption');
  // });

  // change text color on cue changes
  $textTrack[0].track.oncuechange = function() {
       var cue = this.activeCues[0];
       var id = cue.id;
       var spans = $('#transcript').children();
       var currentCaption = spans[id - 1];
       currentCaption.style.color = "blue";
       console.log(spans[id - 1]);
       cue.onexit = function () {
         console.log("cue exit");
         currentCaption.style.color = "black";
       };
  };


  /* Play clicked */
  $playButton.on( "click", function() {
    togglePlay();
  });

  /* Progress skip ahead*/
  $progress[0].addEventListener("click", function(e) {
    var position = (e.pageX - this.offsetLeft) / this.offsetWidth;
    $video[0].currentTime = position * $video[0].duration;
  });

  /* volume clicked */
  $volumeToggle.on("click", function() {
    if ($video.prop("muted")) {
      $volumeToggle.css('background-image','url(img/volume-on-icon.png)');
      $video.prop("muted", false);
    } else {
      $volumeToggle.css('background-image','url(img/volume-off-icon.png)');
      $video.prop("muted", true);
    }
  });

  /* Fullscreen clicked */
  $fullScreenToggle.on( "click", function() {
    console.log("clicked full screen button");
    toggleFullScreen();
  });

  /* Mute sound and change button images for play/pause*/
  function togglePlay() {
     if ($video[0].paused) {
        $playButton.css('background-image','url(img/pause-icon.png)');
        $video[0].play();
     } else {
        $playButton.css('background-image','url(img/play-icon.png)');
        $video[0].pause();
     }
  }

    /* Turn on full screen if available */
    function toggleFullScreen() {
      if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
      $videoContainer.css({height: "100%"});
      $video.css({height: "100%"});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

});
