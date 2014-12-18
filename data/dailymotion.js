    "use strict";

    function main() {

        var streams_r = /"stream_h264[^"]*_url":"[^"]*"/g;
        var url_r = /"(stream_h264[^"]*_url)":"([^"]*)"/;
        var streams = document.body.innerHTML.match(streams_r);
        var url, urls = {};
        streams.forEach(u => {
            var r = u.match(url_r);
            urls[r[1]] = r[2].replace("\\/", "/", "g");
        });
        var types = [
            "stream_h264_url", // H264 512x384
            "stream_h264_hq_url", // H264 848x480
            "stream_h264_hd_url", // H264 1280x720
            "stream_h264_ld_url" // H264 320x240
        ];
        for (var i = 0; i < types.length; i++) {
            if (urls[types[i]]) {
                url = urls[types[i]];
                break;
            }
        }
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
    }
    onReady(main);