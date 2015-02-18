(function() {
    "use strict";

    onReady(() => {
        if (/watch\/\d+\/.*/.test(location.pathname))
            watchPage();
        else if (/[^\/]+\/?$/.test(location.pathname))
            channelPage();
    });

    function watchPage() {
        var ob, url;
        if ((ob = document.getElementById("flashVars"))) {
            url = getURL(ob.value);
        } else if ((ob = document.getElementById("FlashWrap")) &&
            (ob = ob.getElementsByTagName("video")).length) {
            url = ob[0].src;
            ob[0].pause();
            ob[0].remove();
        }
        if (!url)
            return;
        var container = document.getElementById("ItemContainer");
        if (!container)
            return;
        var vp = new VP(container);
        vp.addSrc(url, "medium", "mp4");
        vp.props({
            autoplay: autoPlay(true),
            preload: preLoad(),
            controls: true
        });
        vp.style({
            width: "100%"
        });
        vp.setup();
    }

    function channelPage() {
        var embed = document.getElementsByTagName("embed");
        if (!embed)
            return;
        embed = embed[0];
        var page = embed.src;
        page = page.replace("/fplayer/", "/watch/").replace(/.swf$/, "");
        asyncGet(page).then((data) => {
            var url = getURL(data);
            var container = document.getElementById("ItemContainer");
            //var container = embed.parentElement;
            var vp = new VP(container);
            vp.addSrc(url, "medium", "mp4");
            vp.props({
                autoplay: autoPlay(false),
                preload: preLoad(),
                controls: true
            });
            vp.style({
                width: "100%"
            });
            vp.setup(OPTIONS.production);
        });
    }

    function getURL(e) {
        var data = decodeURIComponent(e.match(/&mediaData=([^&]*)&/)[1]);
        return JSON.parse(data).MP4.mediaURL;
    }

}());