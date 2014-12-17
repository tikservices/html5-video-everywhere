/*globals videojs, PREF_FORMATS, FORMATS, OPTIONS, createNode, asyncGet, logify*/
(function() {
    "use strict";
    var player, player_container;

    function main() {
        player = createNode("video");
        changePlayer();
    }

    function changePlayer() {
        getConfig()
            .then(getVideoInfo)
            .then(function(conf) {
                try {
                    if (player_container)
                        player_container.innerHTML = "";
                    player_container = document.getElementById("video");
                    if (!player_container)
                        return;
                    player_container.children[1].remove();
                    var player_opt = {
                        className: conf.className,
                        controls: true,
                        volume: OPTIONS.volume / 100
                    };
                    player = createNode("video", player_opt);
                    player.appendChild(createNode("source", {
                        src: conf.url
                            //                        type: conf.type
                    }));
                    player_container.appendChild(player);
                } catch (e) {
                    console.error("Exception on changePlayer()", e.lineNumber, e.columnNumber, e.message, e.stack);
                }
            });
    }

    function getConfig() {
        return new Promise(function(resolve, reject) {
            var isWatch = /https?:\/\/vimeo.com\/[\d]+/.test(location.href);
            if (!isWatch)
                reject();
            var player_id, player_class;
            if (isWatch) {
                player_id = location.pathname.match(/^\/([\d]+)/)[1];
                player_class = "player";
            }
            if (!player_id)
                reject();
            resolve({
                isWatch: isWatch,
                id: player_id,
                className: player_class
            });
        });
    }

    function getVideoInfo(conf) {
        var INFO_URL = "https://player.vimeo.com/video/";
        return asyncGet(INFO_URL + conf.id + "/config").then(function(data) {
            data = JSON.parse(data);
            conf.poster = data.video.thumbs.base;
            conf.url = data.request.files.h264.sd.url;
            return Promise.resolve(conf);
        });
    }
    try {
        if (document.readyState !== "loading")
            main();
        else
            document.addEventListener("DOMContentLoaded", main);
    } catch (e) {
        console.error("Exception on main()", e.lineNumber, e.columnNumber, e.message, e.stack);
    }
}());