(function() {
    "use strict";

    onReady(() =>
        getConfig().then(getVideoInfo)
    );

    function injectPlayer(conf) {
        try {
            let player_container, player, stl;
            if (conf.isEmbed) {
                player_container = document.body;
            } else if (conf.isWatch) {
                player_container = document.getElementById("video") ||
                    document.getElementById("video_wrapper");
                if ((stl = player_container.children[0]) &&
                    (stl = stl.sheet) &&
                    (stl.cssRules.length > 0)) {
                    stl = stl.cssRules[0].cssText;
                }
            } else {
                player_container = document.getElementById("clip_" + conf.id);
            }
            if (!player_container)
                return;
            var vp = new VP(player_container);
            vp.srcs(conf.fmts, {
                "high/mp4": "hd",
                "medium/mp4": "sd",
                "low/mp4": "mobile"
            }, (fmt) => fmt.url);
            vp.props({
                className: conf.className,
                autoplay: autoPlay(),
                preload: preLoad(),
                controls: true,
                poster: conf.poster,
                volume: OPTIONS.volume / 100
            });
            vp.tracksList(conf.tracks.map(l => l.lang), (lang, resolve, reject) => {
                var l = conf.tracks.find(l => l.lang === lang);
                if (l === undefined)
                    reject();
                else
                    resolve(l.direct_url || l.url);
            });
            if (stl)
                vp.addCSSRule(stl);
            vp.setup(OPTIONS.production);
            if (conf.isWatch)
                brozarEvents();
        } catch (e) {
            logify("Exception on changePlayer()", e.lineNumber, e.columnNumber, e.message, e.stack);
        }
    }

    function getConfig() {
        return new Promise((resolve, reject) => {
            var isWatch = /https?:\/\/vimeo.com\/[\d]+/.test(location.href) ||
                ogType().indexOf("video") > -1;
            var isEmbed = /https?:\/\/player.vimeo.com\/video/.test(location.href);
            var isChannel = /https?:\/\/vimeo.com\/(channels\/|)\w+/.test(location.href) ||
                ogType().match(/channel|profile/) !== null;
            if (!isWatch && !isChannel && !isEmbed)
                reject();
            var player_id, player_class;
            if (isWatch) {
                player_id = location.pathname.match(/\/([\d]+)/)[1];
                player_class = "player";
            } else if (isEmbed) {
                player_id = location.pathname.match(/video\/([\d]+)/)[1];
                player_class = "fallback";
            } else if (isChannel) {
                player_class = "player";
            }
            if (!player_id && !isChannel)
                reject();
            resolve({
                isWatch: isWatch,
                isEmbed: isEmbed,
                isChannel: isChannel,
                id: player_id,
                className: player_class
            });
        });
    }

    function getVideoInfo(conf) {
        const processData = (conf) => (data) => {
            data = JSON.parse(data);
            conf.fmts = data.request.files.h264;
            conf.poster = data.video.thumbs.base;
            conf.tracks = data.request.text_tracks || [];
            return Promise.resolve(conf);
        };
        const INFO_URL = "//player.vimeo.com/video/";
        if (conf.isChannel) {
            return Array.map(document.getElementsByClassName("player_container"), (el) => {
                var _conf = {};
                for (var va in conf)
                    _conf[va] = conf[va];
                _conf.id = el.id.replace("clip_", "");
                return asyncGet(INFO_URL + _conf.id + "/config").then(processData(_conf))
                    .then(injectPlayer);
            });
        } else {
            return asyncGet(INFO_URL + conf.id + "/config").then(processData(conf))
                .then(injectPlayer);
        }
    }

    function brozarEvents() {
        // change Vimeo default click events of items on brozar element
        var clips = document.getElementById("clips");
        if (clips)
            clips.onclick = function(e) {
                if (e.target === e.currentTarget)
                    return;
                var li = e.target;
                while (li.tagName !== "LI")
                    li = li.parentElement;
                window.location = "/" + li.id.replace("clip_", "");
            };
        var promos = document.getElementsByClassName("js-promo_link");
        var promoClick = function(e) {
            window.location = "/" + e.currentTarget.dataset.clipId;
        };
        for (var i = 0; promos && i < promos.length; i++)
            promos[i].onclick = promoClick;
    }

    function ogType() {
        var t = document.head.querySelector("meta[property=\"og:type\"]");
        return (t) ? t.content : "";
    }
}());