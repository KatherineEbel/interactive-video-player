$(document).ready(function() {
  "use strict";

  //------------------------------------------------
  //  Global Variables
  //------------------------------------------------

  var $video = $("#video");
  var $videoContainer = $("#video-container");
  var $buttonBar = $("#buttonbar");
  var $progress = $("#progress-bar");
  var $playPause = $("#play-pause");
  var $playLarge = $(".fa-play-circle-o");
  var $videoTimer = $("#video-timer");
  var $volumeToggle = $("#volume-toggle");
  var $fullScreenToggle = $("#fullscreen-toggle");
  var $textTrack = $("#text-track");
  var $captions = $("#captions");
  var $captionsToggle = $('#captions-toggle');
  var supportsMp4 = !!document.createElement('video').canPlayType('video/mp4');
  var supportsOgg = !!document.createElement('video').canPlayType('video/ogg');

  //------------------------------------------------
  // Setup Controls
  //------------------------------------------------

  if (supportsMp4 || supportsOgg) {
    $video.removeAttr('controls');
    $buttonBar.css('display','flex');
    $progress.css('display','block');
  } else {
    $textTrack.attr('kind', 'captions');
  }

  // only show controls when hovering over video
  $videoContainer.mouseenter(function() {
    $buttonBar.fadeIn(400);
  })
  .mouseleave(function() {
    $buttonBar.fadeOut(400);
  });
  //------------------------------------------------
  // Progress Bar
  //------------------------------------------------

  $video[0].addEventListener('loadedmetadata', function() {
    var duration = $video[0].duration;
    $progress.attr('max', duration);
    setUpProgressBarForVideo($video[0]);
  });

  // update progress bar with currentTime and update cues for captions
  $video.on('timeupdate', function() {
    setUpProgressBarForVideo(this);
    if ($video[0].ended) {
      $playLarge.fadeIn(600);
    }
    // firefox not supporting oncuechange currently, so use appropriate function for diff browsers
    if ($textTrack[0].track.oncuechange !== undefined) {
      changeCues();
    } else {
      changecuesForFirefox();
    }
  });

  /* Progress seek */
  $progress.on('click', function(e) {
    console.log("clicked");
    var position = (e.pageX - this.offsetLeft) / this.offsetWidth;
    $video[0].currentTime = position * $video[0].duration;
  });

  // setup values for progress bar
  function setUpProgressBarForVideo(video) {
    $videoTimer.text(timeFormat($video[0].currentTime));
    if (!$progress[0].getAttribute('max')) {
      $progress.attr('max', video.duration);
      $progress[0].value = video.currentTime;
    } else {
      $progress[0].value = video.currentTime;
    }
  }

  /* Restarts video*/
  function resetVideo() {
    $playLarge.fadeOut(600);
    $video[0].currentTime = 0;
    setUpProgressBarForVideo($video[0]);
    $captions.css('display', 'none');
    $playPause.togglePlay();
  }

  //------------------------------------------------
  // Helper to format video timer
  //------------------------------------------------

  var timeFormat = function(seconds){
      var m = Math.floor(seconds / 60) < 10 ? '0' + Math.floor(seconds / 60) : Math.floor(seconds / 60);
      var s = Math.floor(seconds - (m * 60)) < 10 ? '0' + Math.floor(seconds - (m * 60)) : Math.floor(seconds - (m * 60));
      var duration = $video[0].duration.toFixed(2);
      if (isNaN(parseFloat(duration))) {
        return m + ':' + s;
      } else {
        return m + ':' + s + " / " + duration;
      }
  };


  //------------------------------------------------
  // Play Button
  //------------------------------------------------
  $playPause.on( "click", function() {
    togglePlay();
  });
  
  $playLarge.on("click", function() {
      if ($video[0].ended) {
        resetVideo();
      }
  });

  /* Mute sound and change button images for play/pause*/
  function togglePlay() {
      if ($video[0].paused) {
        $video[0].play();
        $playPause.removeClass('fa-play');
        $playPause.addClass('fa-pause');
      } else {
        $video[0].pause();
        $playPause.removeClass('fa-pause');
        $playPause.addClass('fa-play');
      }
  }

  /* volume clicked */
  $volumeToggle.on("click", function() {
    if ($video.prop("muted")) {
      $volumeToggle.removeClass('fa-volume-off');
      $volumeToggle.addClass('fa-volume-up');
      $video.prop("muted", false);
    } else {
      $volumeToggle.removeClass('fa-volume-up');
      $volumeToggle.addClass('fa-volume-off');
      $video.prop("muted", true);
    }
  });
  

  //------------------------------------------------
  // Captions
  //------------------------------------------------

  // work around for changing cues on firefox
  function changecuesForFirefox() {
    $( "span" ).toggleClass(function() {
      if ($textTrack[0].track.activeCues.length > 0) {
        var cue = $textTrack[0].track.activeCues[0];
        var id = cue.id;
        $captions.html(cue.text);
        if ( $( this ).is( '#cue-' + id ) ) {
          return $(this).css("color", "#D2AF32");
        } else {
          return $(this).css("color", "#F5A18E");
        }
      }
    });
  }

  // use cuechange event for browsers that support it
  function changeCues() {
    // change text color on cue changes (transcript only)
    $textTrack[0].track.oncuechange = function() {
        if ($textTrack[0].track.activeCues.length > 0) {
          var cue = this.activeCues[0];
           var id = cue.id;
           $captions.html(cue.text);
           var spans = $('#transcript').children();
           var currentCaption = spans[id - 1];
           currentCaption.style.color = "#D2AF32";
           cue.onexit = function () {
             currentCaption.style.color = "#F5A18E";
           };
        }
    };
  }

  // Handle captions Button click

  $captionsToggle.on('click', function() {
    $captions.toggleClass('toggle-hidden');
  });

  // update video-time when span videoent clicked
  $('#transcript span').on('click', function() {
    console.log("clicked");
    var spanIdString = this.id;
    var cueList = $textTrack[0].track.cues;
    var cueId = spanIdString.replace('cue-', '');
    var targetCue = cueList.getCueById(cueId);
    $video[0].currentTime = targetCue.startTime;
  });

  //------------------------------------------------
  // Full Screen
  //------------------------------------------------

  /* Fullscreen clicked */
  $fullScreenToggle.on( "click", function() {
    fullScreenChange();
    toggleFullScreen();
  });
  
  function toggleFullScreen() {
   /* var video = $video[0];*/
   var videoDiv = document.getElementById('video-container');
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
      if (videoDiv.requestFullscreen) {
        videoDiv.requestFullscreen();
      } else if (videoDiv.msRequestFullscreen) {
        videoDiv.msRequestFullscreen();
      } else if (videoDiv.mozRequestFullScreen) {
        videoDiv.mozRequestFullScreen();
      } else if (videoDiv.webkitRequestFullscreen) {
        videoDiv.webkitRequestFullscreen();
      }
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
  
  function fullScreenChange() {
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
      $fullScreenToggle.removeClass('fa-expand');
      $fullScreenToggle.addClass('fa-compress');
    } else {
      $fullScreenToggle.removeClass('fa-compress');
      $fullScreenToggle.addClass('fa-expand');
    }
  }
  

    

});
