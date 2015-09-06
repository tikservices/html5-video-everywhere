/*globals FMT_WRAPPER*/
(function() {
    "use strict";
    var vp;
    var swf_url;

    onReady(() => {
        changePlayer();
        window.addEventListener("spfrequest", function() {
            if (vp)
                vp.stop();
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
                    if (vp)
                        vp.end();
                    var player_container = getPlayerContainer(conf);
                    if (!player_container)
                        return;
                    var seek = getSeek();
                    vp = new VP(player_container);
                    vp.srcs(conf.fmts, FMT_WRAPPER, (fmt) => fmt.url + seek);
                    //vp.containerProps({
                    //    className: conf.className || ""
                    //});
                    vp.props({
                        id: "video_player",
                        className: conf.className || "",
                        autoplay: autoPlay(location.search.search("autoplay=") === -1 ? !conf.isEmbed : location.search.search("autoplay=0") === -1),
                        preload: preLoad(),
                        loop: isLoop(location.search.search("loop=1") !== -1),
                        controls: true,
                        poster: conf.poster || "",
                        volume: OPTIONS.volume / 100
                    });
                    //vp.style({
                    //    position: "relative"
                    //});
                    vp.tracksList((conf.tracks || []).map(i => i.lc), (lang, resolve, reject) => {
                        var o = conf.tracks.find((i) => i.lc === lang);
                        if (o === undefined)
                            return reject();
                        addWebVTT(lang, o.u, resolve, reject);
                    });
                    vp.setup();
                    if (conf.isWatch)
                        playNextOnFinish();
                } catch (e) {
                    logify("EXCEPTION: unexpected error on changePlayer",
                        e.lineNumber, e.columnNumber, e.message, e.stack);
                }
            })
            .catch((rej) => {
                if (rej === undefined)
                    return;
                switch (rej.error) {
                    case "VIDEO_URL_UNACCESSIBLE":
                        if (rej.data.reason)
                            errorMessage("Failed to load video url with the following error message: " +
                                rej.data.reason, rej.conf);
                        break;
                    case "NO_SUPPORTED_VIDEO_FOUND":
                        errorMessage("Failed to find any playable video url." +
                            (rej.unsig ? " All urls are not signed" : ""), rej.conf);
                        break;
                    default:
                        logify("EXCEPTION: unexpected error on changePlayer", rej);
                        break;
                }
            });
    }

    function errorMessage(msg, conf) {
        var error_container;
        if (vp)
            vp.end();
        if (conf)
            error_container = getPlayerContainer(conf);
        if (!error_container)
            error_container = document.getElementById("player-unavailable") || document.getElementById("player");
        if (!error_container)
            return;
        vp = new VP(error_container);
        vp.srcs(conf.fmts, FMT_WRAPPER);
        if (conf && conf.isWatch)
            vp.containerProps({
                className: " player-height player-width player-api"
            });
        if (conf && conf.isChannel)
            vp.containerProps({
                className: " c4-player-container"
            }); //" html5-main-video";
        if (conf && conf.isEmbed) {
            vp.containerProps({
                className: " full-frame"
            });
        }
        vp.containerStyle({
            background: "linear-gradient(to bottom, #383838 0px, #131313 100%) repeat scroll 0% 0% #262626"
        });
        vp.error(msg);
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
            var conf = {};
            conf.isEmbed = location.pathname.startsWith("/embed/");
            conf.isWatch = location.pathname.startsWith("/watch");
            conf.isChannel = location.pathname.startsWith("/channel/") || location.pathname.startsWith("/user/");
            conf.withoutCookies = location.hostname.search("youtube-nocookie.com") > -1;
            if (!conf.isEmbed && !conf.isWatch && !conf.isChannel)
                reject();
            if (conf.isEmbed) {
                conf.id = location.pathname.match(/^\/embed\/([^?#/]*)/)[1];
                conf.className = "full-frame";
            } else if (conf.isChannel) {
                var upsell = document.getElementById("upsell-video");
                if (!upsell)
                    reject();
                conf.id = upsell.dataset["videoId"];
                conf.className = "c4-player-container"; //+ " html5-main-video"
            } else {
                conf.id = location.search.slice(1).match(/v=([^/?#]*)/)[1];
                conf.className = "player-width player-height player-api";
            }
            if (!conf.id)
                reject({
                    error: "PLAYER_ID_NOT_FOUND",
                    conf: conf
                });
            else
                resolve(conf);
        });
    }

    function getVideoInfo(conf) {
        return new Promise((resolve, reject) => {
            var INFO_URL = "https://www.youtube.com/get_video_info?html5=1&hl=en_US&el=detailpage&video_id=";
            if (conf.withoutCookies)
                INFO_URL = "https://www.youtube-nocookie.com/get_video_info?html5=1&hl=en_US&el=detailpage&video_id=";
            if (unsafeWindow.ytplayer && unsafeWindow.ytplayer.config) {
                conf.info = unsafeWindow.ytplayer.config.args.url_encoded_fmt_stream_map;
                conf.poster = unsafeWindow.ytplayer.config.args.iurlsd ||
                    unsafeWindow.ytplayer.config.args.iurl ||
                    unsafeWindow.ytplayer.config.args.iurlhq ||
                    unsafeWindow.ytplayer.config.args.iurlmaxres ||
                    unsafeWindow.ytplayer.config.args.iurlmq;
                if (unsafeWindow.ytplayer.config.args.caption_tracks)
                    conf.tracks = parse(unsafeWindow.ytplayer.config.args.caption_tracks, true);
                swf_url = unsafeWindow.ytplayer.config.url;
                resolve(conf);
            } else {
                asyncGet(INFO_URL + conf.id, {}, "text/plain").then((data) => {
                    if (data.endsWith("="))
                        try {
                            data = atob(data);
                        } catch (_) {}
                    data = parse(data);
                    if (data.status === "fail") {
                        return reject({
                            error: "VIDEO_URL_UNACCESSIBLE",
                            data: data,
                            conf: conf
                        });
                    }
                    // get the poster url
                    if (data.iurlhq)
                        conf.poster = data.iurlhq;
                    // extract avalable formats to fmts object
                    conf.info = data.url_encoded_fmt_stream_map;
                    if (data.caption_tracks)
                        conf.tracks = parse(data.caption_tracks, true);
                    resolve(conf);
                });
            }
        }).then((conf) => {
            var player = createNode("video");
            var unsignedVideos = false;
            conf.fmts = {};
            parse(conf.info, true)
                .filter(it5 => {
                    if (player.canPlayType(it5.type) !== "probably")
                        return false;
                    if (it5.url.search("signature=") === -1) {
                        unsignedVideos = true;
                        if (!OPTIONS.genYTSign)
                            return false;
                    }
                    return true;
                })
                .forEach(fmt => {
                    conf.fmts[fmt.itag] = fmt;
                });
            if (unsignedVideos && OPTIONS.genYTSign) {
                return fixSignature(conf);
            } else {
                return Promise.resolve(conf);
            }
        });
    }

    function fixSignature(conf) {
        return new Promise((resolve, reject) => {
            self.port.emit("fix_signature", {
                fmts: conf.fmts,
                swf_url: swf_url
            });
            self.port.on("fixed_signature", (fmts) => {
                conf.fmts = fmts;
                logify("fixed Signature");
                resolve(conf);
            });
        });
    }

    function playNextOnFinish() {
        //Credits to @durazell github.com/lejenome/youtube-html5-player/issues/9
        if (document.getElementsByClassName("playlist-header").length > 0) {
            vp.on("ended", function(e) {
                if (this.currentTime !== this.duration || OPTIONS.autoNext === false)
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
            });
        }
    }

    function parse(data, splitComma) {
        if (splitComma) {
            return data.split(",").map(i => parse(i));
        } else {
            var res = {};
            var nv;
            data.split("&").forEach((p) => {
                try {
                    nv = p.split("=").map(function(v) {
                        return decodeURIComponent(v.replace(/\+/g, " "));
                    });
                    if (!(nv[0] in res)) res[nv[0]] = nv[1];
                } catch (e) {}
            });
            return res;
        }
    }

    function addWebVTT(lang, url, resolve, reject) {
        asyncGet(url).then((data) => {
            var webvtt = "WEBVTT\n\n";
            var XMLParser = new DOMParser();
            var xml = XMLParser.parseFromString(data, "text/xml");
            if (xml.documentElement.nodeName !== "transcript")
                reject();
            var els = xml.documentElement.childNodes;
            for (var i = 0; i < els.length; i++) {
                var start = els[i].attributes.getNamedItem("start");
                var dur = els[i].attributes.getNamedItem("dur");
                if (start === null || dur === null)
                    continue;
                start = parseFloat(start.value);
                dur = parseFloat(dur.value);
                var s = start % 60;
                var m = (start - s) / 60;
                var tl1 = "" + (m < 10 ? "0" : "") + m + ":" +
                    (s < 10 ? "0" : "") + s.toFixed(3);
                s = (start + dur) % 60;
                m = (start + dur - s) / 60;
                var tl2 = "" + (m < 10 ? "0" : "") + m + ":" +
                    (s < 10 ? "0" : "") + s.toFixed(3);

                webvtt += (i + 1) + "\n" + tl1 + " --> " + tl2 + "\n" + els[i].textContent + "\n\n";
            }
            resolve("data:text/vtt;base64," + btoa(window.unescape(
                encodeURIComponent(webvtt.replace("&#39;", "'", "g")))));
        });
    }

    function getSeek() {
        var seek = 0;
        if (location.search.search("start=") > -1) {
            seek = location.search.match(/start=(\d+)/);
            seek = seek ? parseInt(seek[1]) : 0;
        } else if (location.search.search(/[&?]t=\d/) > -1) {
            seek = location.search.match(/[&?]t=([^&]*)/)[1];
            var h = seek.match(/(\d+)h/);
            var m = seek.match(/(\d+)m/);
            var s = seek.match(/(\d+)s/) || seek.match(/^(\d+)$/);
            seek = (h ? parseInt(h[1]) : 0) * 3600 +
                (m ? parseInt(m[1]) : 0) * 60 +
                (s ? parseInt(s[1]) : 0);
        }
        return seek > 0 ? ("#t=" + seek) : "";
    }
}());