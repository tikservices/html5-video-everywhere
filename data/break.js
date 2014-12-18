(function() {
    "use strict";

    onReady(main);

    function main() {

        var url_r = /"videoUri":\s*"([^"]*)"/;
        var url = (document.head.innerHTML.match(url_r) || ["", ""])[1];
        if (url === "")
            return;
        var player = createNode("video", {
            //	preload: true,
            controls: true,
            autoplay: true,
            src: url
        }, {}, {
            width: "100%",
            heigth: "100%"
        });

        document.body.innerHTML = "";
        document.head.innerHTML = "";
        document.body.appendChild(player);
    }
}());