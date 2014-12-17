(function() {
    "use strict";

    var params = document.body.innerHTML.match(/\"params\",(\"[^\"]*\")/)[1];
    params = JSON.parse(decodeURIComponent(JSON.parse(params)));
    var url = params.video_data[0].sd_src || params.video_data[0].hd_src;
    var player = createNode("video", {
        //		preload: true,
        controls: true,
        autoplay: true,
        src: url
    }, {}, {
        width: "100%",
        heigth: "100%"
    });

    document.getElementsByClassName("_53j5")[0].innerHTML = "";
    document.getElementsByClassName("_53j5")[0].appendChild(player);
    //        location = url;
}());