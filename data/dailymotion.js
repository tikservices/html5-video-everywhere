(function() {
    "use strict";

    onReady(main);

    function main() {

        var streams_r = /"stream_h264[^"]*_url":"[^"]*"/g;
        var url_r = /"(stream_h264[^"]*_url)":"([^"]*)"/;
        var streams = document.body.innerHTML.match(streams_r);
        var url, urls = {};
        streams.forEach(u => {
            var r = u.match(url_r);
            urls[r[1]] = r[2].replace("\\/", "/", "g");
        });
        var types = [];
        url = getPreferredFmt(urls, {
            "higher/mp4": "stream_h264_hd_url", // H264 1280x720
            "high/mp4": "stream_h264_hq_url", // H264 848x480
            "medium/mp4": "stream_h264_url", // H264 512x384
            "low/mp4": "stream_h264_ld_url" // H264 320x240
        });
        if (url === undefined)
            return;
        var poster = (document.body.innerHTML.match(/"thumbnail_url":"([^"]*)"/) || ["", ""])[1].replace("\\/", "/", "g");
        var player = createNode("video", {
            //	preload: true,
            controls: true,
            poster: poster,
            //      autoplay: true,
            src: url
        }, {}, {
            width: "100%",
            heigth: "100%"
        });

        document.body.innerHTML = "";
        document.body.appendChild(player);
        onPrefChange.push(function(pref) {
            if (player && pref === "volume") {
                player.volume = OPTIONS[pref] / 100;
            }
        });
    }
}());