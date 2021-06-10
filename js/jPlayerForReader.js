$(window).load(function (e) {
    $('#readScreen').click(function (e) {
        e.preventDefault();
        $('#readScreenWindow').fadeToggle();
        $('#playListener').focus();
    });
    $('#closeRSWindow').click(function (e) {
        e.preventDefault();
        $('#readScreenWindow').fadeOut();
    });
    $('#readScreenWindow a').click(function (e) {
        e.preventDefault();
    });
    $('#backwardsListener').click(function (e) {
        e.preventDefault();
        var duration = $('#jPlayerForReader').data('jPlayer').status.duration;
        var currentTime = $('#jPlayerForReader').data('jPlayer').status.currentTime;
        var percent = Math.max((currentTime - 5) / duration * 100, 0)
        $('#jPlayerForReader').jPlayer("playHead", percent);
    });
    $('#forwardListener').click(function (e) {
        e.preventDefault();
        var duration = $('#jPlayerForReader').data('jPlayer').status.duration;
        var currentTime = $('#jPlayerForReader').data('jPlayer').status.currentTime;
        var percent = Math.min((currentTime + 5) / duration * 100, 100)
        $('#jPlayerForReader').jPlayer("playHead", percent);
    });
    $('#jPlayerForReader').jPlayer({
        ready: function () {
            $(this).jPlayer("setMedia", {
                mp3: $('#playListener').attr('href')
            });
        },
        swfPath: "/js/lib/jQuery.jPlayer.2.0.0",
        supplied: "mp3",
        cssSelectorAncestor: "",
        cssSelector: {
            videoPlay: "#nonExist",
            play: "#playListener",
            pause: "#pauseListener",
            stop: "#stopListener",
            mute: "#muteListener",
            unmute: "#unmuteListener",
            playBar: "#RMProgress",
            currentTime: "#currentTime",
            duration: "#duration"
        },
        play: function () {
            console.log("audio playing");
        }

    });

});
