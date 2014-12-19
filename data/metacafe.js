(function() {
    "use strict";

    onReady(main);

    function main() {
        var ob = document.getElementById("flashVars");
        if (!ob)
            return;
        var data = decodeURIComponent(ob.value.match(/&mediaData=([^&]*)&/)[1]);

        var url = JSON.parse(data).MP4.mediaURL;
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