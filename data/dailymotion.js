(function() {
    "use strict";

    onReady(() => {

        // VIDEO_ID = location.pathname.match(/\/embed\/video\/([^_]+)/)[1];
        // asyncGet http://www.dailymotion.com/json/video/<VIDEO_ID>?fields=stream_audio_url,stream_h264_hd1080_url,stream_h264_hd_url,stream_h264_hq_url,stream_h264_ld_url,stream_h264_url,stream_hls_url,stream_live_hls_url,thumbnail_120_url,thumbnail_240_url,thumbnail_url
        // returns a json
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
            // stream_h264_hd1080_url
            "higher/mp4": "stream_h264_hd_url", // H264 1280x720
            "high/mp4": "stream_h264_hq_url", // H264 848x480
            "medium/mp4": "stream_h264_url", // H264 512x384
            "low/mp4": "stream_h264_ld_url" // H264 320x240
        });
        if (url === undefined)
            return;
        var poster = (document.body.innerHTML.match(/"thumbnail_url":"([^"]*)"/) || ["", ""])[1].replace("\\/", "/", "g");
        var player = createNode("video", {
            controls: true,
            autoplay: autoPlay(),
            preload: preLoad(),
            poster: poster,
            src: url
        }, {
            width: "100%",
            heigth: "100%"
        });

        document.body.innerHTML = "";
        document.body.appendChild(player);
    });
}());