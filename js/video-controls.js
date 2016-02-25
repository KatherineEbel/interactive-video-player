// JavaScript Document

$(document).ready(function() {
  "use strict";
  
  var video = $("#video");
  var buttonBar = $("#buttonbar");
  var progress = $("#progress-bar");
  var playButton = $("#play-pause");
  var volumeToggle = $("#volume-toggle");
  var fullScreenToggle = $("#fullscreen-toggle");
  var subTitles = document.getElementById('subtitles');
  var supportsMp4 = !!document.createElement('video').canPlayType('video/mp4');
  var supportsOgg = !!document.createElement('video').canPlayType('video/ogg');
  
  if (supportsMp4 || supportsOgg) {
    console.log("can play video");
    video.removeAttr('controls');
    buttonBar.css('display','flex');
    progress.css('display','block');
  } else {
    console.log("can't play video"); 
  }
  
  video.get(0).addEventListener('loadedmetadata', function() {
    var duration = video.get(0).duration;
    progress.attr('max', duration);
  });
  
  var trackElements = document.querySelectorAll("track");
  // for each track element
  trackElements[0].addEventListener("load", function() {
    var textTrack = this.track; // gotcha: "this" is an HTMLTrackElement, not a TextTrack object
    for (var j = 0; j < textTrack.cues.length; ++j) {
      var cue = textTrack.cues[j];
      var captions = document.getElementById('caption-text');
      captions.innerHTML += cue.text;
    }
  });
  
  video.get(0).addEventListener('timeupdate', function() {
    var vid = video.get(0);
    var prog = progress.get(0);
    if (!prog.getAttribute('max')) {
      prog.setAttribute('max', vid.duration);
      prog.value = vid.currentTime;
    } else {
      prog.value = vid.currentTime; 
    }
  });
  
  /* Play clicked */
  playButton.on( "click", function() {
    togglePlay();
  });
  
  /* volume clicked */
  volumeToggle.on("click", function() {
    if (video.prop("muted")) {
      volumeToggle.css('background-image','url(img/volume-on-icon.png)');
      video.prop("muted", false);
    } else {
      volumeToggle.css('background-image','url(img/volume-off-icon.png)');
      video.prop("muted", true);
    }
  });
  
  /* Fullscreen clicked */
  fullScreenToggle.on( "click", function() {
    console.log("clicked full screen button");
    toggleFullScreen();
  });
  
  /* Mute sound and change button images for play/pause*/
  function togglePlay() {
     if (video.get(0).paused) {
        playButton.css('background-image','url(img/pause-icon.png)');
        video.get(0).play();
     } else {
        playButton.css('background-image','url(img/play-icon.png)');
        video.get(0).pause();
     }
  }

/*    function restart() {
      video.get(0).currentTime = 0;
    }

    function skip(value) {
      video.get(0).currentTime += value;
    } */
    
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
      $('.video-container').css({height: "100%"});
      video.css({height: "100%"});
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

