(function() {
    "use strict";
    onReady(() => {
        var params = document.body.innerHTML.match(/"params",("[^"]*")/)[1];
        params = JSON.parse(decodeURIComponent(JSON.parse(params)));
        //	var container = document.getElementsByClassName("_53j5")[0];
        var container = document.getElementsByClassName("stageContainer")[0];
        var vp = new VP(container);
        logify(params.video_data[0]);
        vp.srcs({
            "medium/mp4": params.video_data[0].sd_src,
            "high/mp4": params.video_data[0].hd_src
        });
        vp.props({
            controls: true,
            autoplay: autoPlay(true),
            preload: preLoad()
        });
        vp.style({
            width: "100%",
            heigth: "100%"
        });
        vp.setup(OPTIONS.production);

    });
}());