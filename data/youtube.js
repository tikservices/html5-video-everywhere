/*globals FMT_WRAPPER*/
(function() {
    "use strict";
    var player, player_container;

    onReady(() => {
        // onInit does not works on channel/user page videos
        player = createNode("video");
        changePlayer();
        window.addEventListener("spfrequest", function() {
            if (player) {
                //                player.pause();
                //                player.src = undefined;
                player.onended = undefined;
                player.currentTime = player.duration;
            }
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
                        rmChildren(player_container);
                    player_container = getPlayerContainer(conf);
                    if (!player_container)
                        return;
                    rmChildren(player_container);
                    player_container.className = conf.className || "";
                    player = createNode("video", {
                        id: "video_player",
                        className: conf.className || "",
                        autoplay: autoPlay(!conf.isEmbed),
                        preload: preLoad(),
                        controls: true,
                        poster: conf.poster || "",
                        volume: OPTIONS.volume / 100
                    }, {
                        position: "relative"
                    });
                    player.appendChild(createNode("source", {
                        src: conf.url,
                        type: conf.type
                    }));
                    player_container.appendChild(player);
                    if (conf.isWatch)
                        playNextOnFinish();
                } catch (e) {
                    console.error("Exception on changePlayer()", e.lineNumber, e.columnNumber, e.message, e.stack);
                }
            })
            .catch((rej) => {
                if (rej === undefined)
                    return;
                switch (rej.error) {
                    case "VIDEO_URL_UNACCESSIBLE":
                        var error = rej.data.match(/reason=([^&]*)&/);
                        if (error)
                            errorMessage("Failed to load video url with the following error message: " +
                                error[1].replace("+", " ", "g"));
                        break;
                    case "NO_SUPPORTED_VIDEO_FOUND":
                        errorMessage("Failed to find any playable video url." +
                            (rej.unsig ? " All urls are not signed" : ""), rej.conf);
                        break;
                }
            });
    }

    function errorMessage(msg, conf) {
        logify("errorMessage", msg, conf);
        var error_container;
        if (conf)
            error_container = getPlayerContainer(conf);
        if (!error_container)
            error_container = document.getElementById("player-unavailable") || document.getElementById("player");
        if (!error_container)
            return;
        if (conf && conf.isWatch)
            error_container.className += " player-height player-width";
        if (conf && conf.isChannel)
            error_container.className += " c4-player-container"; //" html5-main-video";
        if (conf && conf.isEmbed) {
            error_container.className += " full-frame";
        }
        error_container.style.background = "linear-gradient(to bottom, #383838 0px, #131313 100%) repeat scroll 0% 0% #262626";
        rmChildren(error_container);
        error_container.appendChild(createNode("p", {
            textContent: "Ooops! :("
        }, {
            padding: "15px",
            fontSize: "20px"
        }));
        error_container.appendChild(createNode("p", {
            textContent: msg
        }, {
            fontSize: "20px"
        }));
    }

    function getPlayerContainer(conf) {
        if (conf.isWatch)
            return document.getElementById("player-mole-container");
        if (conf.isEmbed)
            return document.body;
        if (conf.isChannel)
            return document.getElementsByClassName("c4-player-container")[0];
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
                player_class = "c4-player-container"; //+ " html5-main-video"
            } else {
                player_id = location.search.slice(1).match(/v=([^/?#]*)/)[1];
                player_class = "player-width player-height";
            }
            if (!player_id)
                reject({
                    error: "PLAYER_ID_NOT_FOUND"
                });
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
        var INFO_URL = "https://www.youtube.com/get_video_info?html5=1&hl=en_US&el=detailpage&video_id=";
        return asyncGet(INFO_URL + conf.id, {}, "text/plain").then((data) => {
            if (data.endsWith("="))
                try {
                    data = atob(data);
                } catch (_) {}
            if (/status=fail/.test(data)) {
                return Promise.reject({
                    error: "VIDEO_URL_UNACCESSIBLE",
                    data: data
                });
            }
            // get the poster url
            var poster = data.match(/iurlhq=([^&]*)/);
            if (poster)
                conf.poster = decodeURIComponent(poster[1]);
            // extract avalable formats to fmts object
            var info = data.match(/url_encoded_fmt_stream_map=([^&]*)/)[1];
            info = decodeURIComponent(info);
            var fmt, fmts = {},
                unsignedVideos;
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
                    unsignedVideos = true;
                    logify("Url without signature!!", it6.itag);
                    return false;
                })
                .forEach(fmt => fmts[fmt.itag] = fmt);
            // choose best format from fmts onject
            fmt = getPreferredFmt(fmts, FMT_WRAPPER);
            if (fmt === undefined) {
                return Promise.reject({
                    error: "NO_SUPPORTED_VIDEO_FOUND",
                    unsig: unsignedVideos,
                    conf: conf
                });
            } else {
                conf.url = fmt.url;
                conf.type = fmt.type;
                return Promise.resolve(conf);
            }
        });
    }

    function playNextOnFinish() {
        //Credits to @durazell github.com/lejenome/youtube-html5-player/issues/9
        if (document.getElementsByClassName("playlist-header").length > 0) {
            player.onended = function(e) {
                if (player.currentTime !== player.duration || OPTIONS.autoNext === false)
                    return;
                var cur = 0,
                    len = 0;
                var current, playlist;
                if ((current = document.getElementsByClassName("currently-playing")).length > 0) {
                    cur = parseInt(current[0].dataset["index"]) + 1;
                } else if ((current = document.getElementById("playlist-current-index"))) {
                    cur = parseInt(current.textContent);
                }
                if ((playlist = document.getElementsByClassName("playlist-videos-list")).length > 0) {
                    len = playlist[0].childElementCount;
                } else if ((playlist = document.getElementById("playlist-length"))) {
                    len = parseInt(playlist.textContent);
                }

                if (isNaN(cur) === true || isNaN(len) === true) {
                    logify("Cannot find location in playlist, autoplay failed");
                    return;
                }

                if (cur < len) {
                    window.location.href = document.getElementsByClassName("yt-uix-scroller-scroll-unit")[cur].getElementsByTagName("a")[0].href;
                }
            };
        }
    }
}());