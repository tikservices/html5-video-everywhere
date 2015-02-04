(function() {
    "use strict";
    // Facebook module is injected when page is "ready", so onReady() will exec
    // the code directly, even before addon preferences are fetched. Because
    // they are needed by the following code, we use onInit() instead of
    // onReady() so our code get Executed after the prefernces get fetched.
    // Waw! seems the longest code documentation I ever wrote o.0
    onInit(() => {
        var params = document.body.innerHTML.match(/\"params\",(\"[^\"]*\")/)[1];
        params = JSON.parse(decodeURIComponent(JSON.parse(params)));
        var url = getPreferredFmt({
            "medium/mp4": params.video_data[0].sd_src,
            "high/mp4": params.video_data[0].hd_src
        });
        if (url === undefined)
            return;
        //	var container = document.getElementsByClassName("_53j5")[0];
        var container = document.getElementsByClassName("stageContainer")[0];
        var vp = new VP(container);
        vp.setMainSrc(url, "video/mp4");
        vp.props({
            controls: true,
            autoplay: autoPlay(true),
            preload: preLoad()
        });
        vp.style({
            width: "100%",
            heigth: "100%"
        });
        vp.setup();

    });
}());