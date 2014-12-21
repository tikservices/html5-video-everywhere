/*globals FMT_WRAPPER*/
(function() {
    "use strict";
    var player, player_container;

    onReady(() => {
        player = createNode("video");
        changePlayer();
        window.addEventListener("spfrequest", function() {
            if (player)
                player.src = "";
        });
        window.addEventListener("spfdone", function() {
            changePlayer();
        });
    });

    function changePlayer() {
        getConfig()
            .then(getVideoInfo)
            .then((conf) => {
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
                    player = createNode("video", {
                        id: "video_player",
                        className: conf.className || "",
                        autoplay: autoPlay(!conf.isEmbed),
                        preload: preLoad(),
                        controls: true,
                        poster: conf.poster || "",
                        volume: OPTIONS.volume / 100
                    });
                    player.appendChild(createNode("source", {
                        src: conf.url,
                        type: conf.type
                    }));
                    player_container.appendChild(player);
                } catch (e) {
                    console.error("Exception on changePlayer()", e.lineNumber, e.columnNumber, e.message, e.stack);
                }
            });
    }

    function getConfig() {
        return new Promise((resolve, reject) => {
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
        return asyncGet(INFO_URL + conf.id, {}, "text/plain").then((data) => {
            // get the poster url
            var poster = data.match(/iurlhq=([^&]*)/);
            if (poster)
                conf.poster = decodeURIComponent(poster[1]);
            // extract avalable formats to fmts object
            var info = data.match(/url_encoded_fmt_stream_map=([^&]*)/)[1];
            info = decodeURIComponent(info);
            var fmt, fmts = {};
            info.split(",")
                .map(it1 => {
                    var oo = {};
                    it1.split("&")
                        .map(it2 => it2.split("="))
                        .map(it3 => [it3[0], decodeURIComponent(it3[1])])
                        .forEach(it4 => oo[it4[0]] = it4[1]);
                    return oo;
                })
                .filter(it5 => (player.canPlayType(
                    (it5.type = it5.type.replace("+", " ", "g"))
                ) === "probably"))
                .filter(it6 => {
                    if (it6.url.search("signature=") > 0)
                        return true;
                    logify("Url without signature!!", it6);
                    return false;
                })
                .forEach(fmt => fmts[fmt.itag] = fmt);
            // choose best format from fmts onject
            fmt = getPreferredFmt(fmts, FMT_WRAPPER);
            if (fmt === undefined) {
                return Promise.reject();
            } else {
                conf.url = fmt.url;
                conf.type = fmt.type;
                return Promise.resolve(conf);
            }
        });
    }
}());