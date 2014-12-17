/*globals videojs, PREF_FORMATS, FORMATS, OPTIONS, asyncGet, createNode, onPrefChange*/
(function() {
    "use strict";
    var player, player_container;

    function main() {
        player = createNode("video");
        changePlayer();
        window.addEventListener("spfrequest", function() {
            if (player)
                player.src = "";
        });
        window.addEventListener("spfdone", function() {
            changePlayer();
        });
        onPrefChange.push(function(pref) {
            if (player && pref === "volume") {
                player[name] = OPTIONS[pref] / 100;
            }
        });
    }

    function changePlayer() {
        getConfig()
            .then(getVideoInfo)
            .then(function(conf) {
                try {
                    if (player_container)
                        player_container.innerHTML = "";
                    player_container = document.getElementById("player-mole-container");
                    if (conf.isEmbed)
                        player_container = document.body;
                    if (conf.isChannel)
                        player_container = document.getElementsByClassName("c4-player-container")[0];
                    if (!player_container)
                        return;
                    player_container.innerHTML = "";
                    var player_opt = {
                        id: "video_player",
                        className: "video-js vjs-default-skin " + conf.className,
                        controls: true,
                        volume: OPTIONS.volume / 100
                    };
                    if (conf.isEmbed)
                        player_opt.poster = conf.poster ? conf.poster : "";
                    else
                        player_opt.autoplay = true;
                    player = createNode("video", player_opt);
                    player.appendChild(createNode("source", {
                        src: conf.url,
                        type: conf.type
                    }));
                    //videojs(player); //TODO: use video-js custom video player
                    player_container.appendChild(player);
                } catch (e) {
                    console.error("Exception on changePlayer()", e.lineNumber, e.columnNumber, e.message, e.stack);
                }
            });
    }

    function getConfig() {
        return new Promise(function(resolve, reject) {
            var isEmbed = location.href.search("youtube.com/embed/") > -1;
            var isWatch = location.href.search("youtube.com/watch?") > -1;
            var isChannel = location.href.search("youtube.com/channel/") > -1 || location.href.search("youtube.com/user/") > -1;
            if (!isEmbed && !isWatch && !isChannel)
                reject();
            var player_id, player_class;
            if (isEmbed) {
                player_id = location.pathname.match(/^\/embed\/([^?#/]*)/)[1];
                player_class = "full-frame";
            } else if (isChannel) {
                var upsell = document.getElementById("upsell-video");
                if (!upsell)
                    reject();
                player_id = upsell.dataset["videoId"];
                player_class = "html5-main-video";
            } else {
                player_id = location.search.slice(1).match(/v=([^/?#]*)/)[1];
                player_class = "player-width player-height";
            }
            if (!player_id)
                reject();
            resolve({
                isEmbed: isEmbed,
                isWatch: isWatch,
                isChannel: isChannel,
                id: player_id,
                className: player_class
            });
        });
    }

    function getVideoInfo(conf) {
        var INFO_URL = "https://www.youtube.com/get_video_info?hl=en_US&el=detailpage&video_id=";
        return asyncGet(INFO_URL + conf.id, {}, "text/plain").then(function(data) {
            var poster = data.match(/iurlhq=([^&]*)/);
            if (poster)
                conf.poster = decodeURIComponent(poster[1]);
            var info = data.match(/url_encoded_fmt_stream_map=([^&]*)/)[1];
            info = decodeURIComponent(info);
            var formats = {};
            info.split(",").forEach(function(f, i) {
                var itag = f.match(/itag=([^&]*)/)[1];
                var url = decodeURIComponent(f.match(/url=([^&]*)/)[1]);
                var type = decodeURIComponent(f.match(/type=([^&]*)/)[1]);
                type = type.replace("+", " ", "g");
                if (player.canPlayType(type) === "probably")
                    formats[itag] = {
                        url: url,
                        type: type
                    };
            });
            if (Object.keys(FORMATS).length < 1)
                return Promise.reject();
            for (var i = 0; i < PREF_FORMATS.length; i++)
                if (formats[PREF_FORMATS[i]]) {
                    conf.url = formats[PREF_FORMATS[i]].url;
                    conf.type = formats[PREF_FORMATS[i]].type;
                    return Promise.resolve(conf);
                    break;
                }
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