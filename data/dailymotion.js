(function() {
    "use strict";

    onReady(() => {

        // VIDEO_ID = location.pathname.match(/\/embed\/video\/([^_]+)/)[1];
        // asyncGet http://www.dailymotion.com/json/video/<VIDEO_ID>?fields=stream_audio_url,stream_h264_hd1080_url,stream_h264_hd_url,stream_h264_hq_url,stream_h264_ld_url,stream_h264_url,stream_hls_url,stream_live_hls_url,thumbnail_120_url,thumbnail_240_url,thumbnail_url
        // returns a json
        var urls = {},
            poster;
        if (unsafeWindow.info) {
            urls = unsafeWindow.info;
            poster = unsafeWindow.info.thumbnail_url ||
                unsafeWindow.info.thumbnail_240_url ||
                unsafeWindow.info.thumbnail_120_url;
        } else {
            var streams_r = /"stream_h264[^"]*_url":"[^"]*"/g;
            var url_r = /"(stream_h264[^"]*_url)":"([^"]*)"/;
            var streams = document.body.innerHTML.match(streams_r);
            streams.forEach(u => {
                var r = u.match(url_r);
                urls[r[1]] = r[2].replace("\\/", "/", "g");
            });
            poster = (document.body.innerHTML.match(/"thumbnail_url":"([^"]*)"/) || ["", ""])[1].replace("\\/", "/", "g");
        }
        var vp = new VP(document.body);
        vp.srcs(urls, {
            // stream_h264_hd1080_url
            "higher/mp4": "stream_h264_hd_url", // H264 1280x720
            "high/mp4": "stream_h264_hq_url", // H264 848x480
            "medium/mp4": "stream_h264_url", // H264 512x384
            "low/mp4": "stream_h264_ld_url" // H264 320x240
        });
        vp.props({
            controls: true,
            autoplay: autoPlay(),
            preload: preLoad(),
            loop: isLoop(),
            poster: poster
        });
        vp.style({
            width: "100%",
            height: "100%"
        });
        vp.setup();
    });
}());