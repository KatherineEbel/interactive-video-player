$(document).ready(function() {
  "use strict";

  //------------------------------------------------
  //  Global Variables
  //------------------------------------------------

  var $video = $("#video");
  var $videoContainer = $("#video-container");
  var $buttonBar = $("#buttonbar");
  var $controls = $("#controls");
  var $progress = $("#progress-bar");
  var $playPause = $("#play-pause");
  var $repeat = $(".fa-repeat");
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
    /*$progress.css('display','block');*/
  } else {
    $textTrack.attr('kind', 'captions');
  }

  // only show controls when hovering over video
  $videoContainer.mouseenter(function() {
    $controls.fadeIn(400);
  })
  .mouseleave(function() {
    $controls.fadeOut(400);
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
      $captions.fadeOut(400);
      $repeat.fadeIn(600);
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
    $repeat.fadeOut(400);
    var position = (e.pageX - this.offsetLeft) / this.offsetWidth;
    $video[0].currentTime = position * $video[0].duration;
    if ($video[0].paused) {
      toggleIcon($playPause, 'fa-pause', 'fa-play');
    }
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
  
  $repeat.on("click", function() {
     resetVideo();
  });
  
  /* Restarts video*/
  function resetVideo() {
    $repeat.fadeOut(600);
    $video[0].load();
    setUpProgressBarForVideo($video[0]);
    toggleIcon($playPause, 'fa-pause', 'fa-play');
  }
  
  

  /* Mute sound and change button images for play/pause*/
  function togglePlay() {
      if ($video[0].paused) {
        $video[0].play();
        toggleIcon($playPause, 'fa-play', 'fa-pause');
      } else {
        $video[0].pause();
        toggleIcon($playPause, 'fa-pause', 'fa-play');
      }
  }

  /* volume clicked */
  $volumeToggle.on("click", function() {
    if ($video.prop("muted")) {
      toggleIcon($volumeToggle, 'fa-volume-off', 'fa-volume-up');
      $video.prop("muted", false);
    } else {
      toggleIcon($volumeToggle, 'fa-volume-up', 'fa-volume-off');
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
    if ($textTrack[0].track.activeCues.length > 0) {
      $captions.toggleClass('toggle-hidden');
    }
    if ($(this).not('toggle-hidden')) {
       $(this).css("display", "flex");
    }
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
  
  // listen for full screen change to toggle full screen icon
  $(document).on('webkitfullscreenchange', function() {
    toggleIcon($fullScreenToggle, 'fa-expand', 'fa-compress');
  });
  
  $(document).on('mozfullscreenchange', function() {
    console.log("mozfullscreen event");
    toggleIcon($fullScreenToggle, 'fa-expand', 'fa-compress');
  });
  
  function toggleIcon(icon, firstClass, secondClass) {
    if (icon.hasClass(firstClass)) {
      icon.removeClass(firstClass);
      icon.addClass(secondClass);
    } else {
      icon.removeClass(secondClass);
      icon.addClass(firstClass);
    }
  }
});
