(function() {
    "use strict";

    onReady(() => {
        if (/watch\/\d+\/.*/.test(location.pathname))
            watchPage();
        else if (/[^\/]+\/?$/.test(location.pathname))
            channelPage();
    });

    function watchPage() {
        let ob, url;
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
        let container = document.getElementById("ItemContainer");
        if (!container)
            return;
        let vp = new VP(container);
        vp.addSrc(url, "medium", "mp4");
        vp.props({
            autoplay: autoPlay(true),
            preload: preLoad(),
            loop: isLoop(),
            controls: true
        });
        vp.style({
            width: "100%"
        });
        vp.setup();
    }

    function channelPage() {
        let embed = document.getElementsByTagName("embed");
        if (!embed)
            return;
        embed = embed[0];
        let page = embed.src;
        page = page.replace("/fplayer/", "/watch/").replace(/.swf$/, "");
        asyncGet(page).then((data) => {
            let url = getURL(data);
            let container = document.getElementById("ItemContainer");
            //let container = embed.parentElement;
            let vp = new VP(container);
            vp.addSrc(url, "medium", "mp4");
            vp.props({
                autoplay: autoPlay(false),
                preload: preLoad(),
                loop: isLoop(),
                controls: true
            });
            vp.style({
                width: "100%"
            });
            vp.setup();
        });
    }

    function getURL(e) {
        let data = decodeURIComponent(e.match(/&mediaData=([^&]*)&/)[1]);
        return JSON.parse(data).MP4.mediaURL;
    }

}());
