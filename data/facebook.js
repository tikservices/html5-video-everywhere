(function() {
    "use strict";
    onReady(() => {
        let params = document.body.innerHTML.match(/"params",("[^"]*")/)[1];
        params = JSON.parse(decodeURIComponent(JSON.parse(params)));
        //	let container = document.getElementsByClassName("_53j5")[0];
        let container = document.getElementsByClassName("stageContainer")[0];
        let vp = new VP(container);
        logify(params.video_data[0]);
        vp.srcs({
            "medium/mp4": params.video_data[0].sd_src,
            "high/mp4": params.video_data[0].hd_src
        });
        vp.props({
            controls: true,
            autoplay: autoPlay(true),
            preload: preLoad(),
            loop: isLoop()
        });
        vp.style({
            width: "100%",
            heigth: "100%"
        });
        vp.setup();

    });
}());
