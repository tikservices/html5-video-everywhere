(function() {
    "use strict";

    onReady(main);

    function main() {
        if (/watch\/\d+\/.*/.test(location.pathname))
            watchPage();
        else if (/[^\/]+\/?$/.test(location.pathname))
            channelPage();
    }

    function watchPage() {
        var ob = document.getElementById("flashVars");
        if (!ob)
            return;
        var url = getURL(ob.value);
        var player = createNode("video", {
            controls: true,
            autoplay: true,
            src: url
        });

        var container = document.getElementById("ItemContainer");
        if (!container)
            return;
        container.innerHTML = "";
        container.appendChild(player);
        onPrefChange.push(function(pref) {
            if (player && pref === "volume") {
                player.volume = OPTIONS[pref] / 100;
            }
        });
    }

    function channelPage() {
        var embed = document.getElementsByTagName("embed");
        if (!embed)
            return;
        embed = embed[0];
        var page = embed.src;
        page = page.replace("/fplayer/", "/watch/").replace(/.swf$/, "");
        asyncGet(page).then(function(data) {
            var url = getURL(data);
            var player = createNode("video", {
                controls: true,
                autoplay: false,
                src: url
            });
            var container = embed.parentElement;
            container.innerHTML = "";
            container.appendChild(player);

        });
    }

    function getURL(e) {
        var data = decodeURIComponent(e.match(/&mediaData=([^&]*)&/)[1]);
        return JSON.parse(data).MP4.mediaURL;
    }

}());