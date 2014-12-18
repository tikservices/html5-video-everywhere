(function() {
    "use strict";

    onReady(main);

    function main() {
        //JSON.parse(decodeURIComponent(flashVarsCache.mediaData)).MP4.mediaURL
        var mediaData_r = /"mediaData":\s*"([^"]*)"/;
        var mediaData = decodeURIComponent((document.body.innerHTML.match(mediaData_r) || ["", ""])[1]);
        if (mediaData === "")
            return;
        var url = JSON.parse(mediaData).MP4.mediaURL;
        var player = createNode("video", {
            //	preload: true,
            controls: true,
            autoplay: true,
            src: url
                //        }, {}, {
                //            width: "100%",
                //            heigth: "100%"
        });

        var container = document.getElementById("ItemContainer");
        if (!container)
            return;
        container.innerHTML = "";
        container.appendChild(player);
    }
}());