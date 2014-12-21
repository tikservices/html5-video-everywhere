(function() {
    "use strict";

    onReady(() =>
        getConfig().then(getVideoInfo)
    );

    function injectPlayer(conf) {
        try {
            let player_container, player;
            if (conf.isEmbed) {
                player_container = document.body;
                player_container.innerHTML = "";
            } else if (conf.isWatch) {
                player_container = document.getElementById("video");
                player_container.children[1].remove();
            } else {
                player_container = document.getElementById("clip_" + conf.id);
                player_container.innerHTML = "";
            }
            if (!player_container)
                return;
            player = createNode("video", {
                className: conf.className,
                autoplay: autoPlay(),
                preload: preLoad(),
                controls: true,
                poster: conf.poster,
                volume: OPTIONS.volume / 100
            });
            player.appendChild(createNode("source", {
                src: conf.url
            }));
            player_container.appendChild(player);
        } catch (e) {
            console.error("Exception on changePlayer()", e.lineNumber, e.columnNumber, e.message, e.stack);
        }
    }

    function getConfig() {
        return new Promise((resolve, reject) => {
            var isWatch = /https?:\/\/vimeo.com\/[\d]+/.test(location.href);
            var isEmbed = /https?:\/\/player.vimeo.com\/video/.test(location.href);
            var isChannel = /https?:\/\/vimeo.com\/(channels\/|)\w+/.test(location.href);
            if (!isWatch && !isChannel && !isEmbed)
                reject();
            var player_id, player_class;
            if (isWatch) {
                player_id = location.pathname.match(/^\/([\d]+)/)[1];
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
            var fmt = getPreferredFmt(data.request.files.h264, {
                "high/mp4": "hd",
                "medium/mp4": "sd",
                "low/mp4": "mobile"
            });
            if (fmt === undefined)
                return Promise.reject();
            conf.poster = data.video.thumbs.base;
            conf.url = fmt.url;
            return Promise.resolve(conf);
        };
        const INFO_URL = "https://player.vimeo.com/video/";
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
}());