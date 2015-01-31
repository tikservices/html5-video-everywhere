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
        var player = createNode("video", {
            autoplay: autoPlay(true),
            preload: preLoad(),
            controls: true,
            src: url
        });

        var container = document.getElementById("ItemContainer");
        if (!container)
            return;
        rmChildren(container);
        container.appendChild(player);
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
            var player = createNode("video", {
                autoplay: autoPlay(false),
                preload: preLoad(),
                controls: true,
                src: url
            });
            var container = embed.parentElement;
            rmChildren(container);
            container.appendChild(player);

        });
    }

    function getURL(e) {
        var data = decodeURIComponent(e.match(/&mediaData=([^&]*)&/)[1]);
        return JSON.parse(data).MP4.mediaURL;
    }

}());