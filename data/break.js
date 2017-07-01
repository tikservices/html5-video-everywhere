(function() {
    "use strict";

    onReady(() => {
        let url_r = /"uri":\s*"([^"]*)"/;
        let width_r = /"width":\s*([^\s,]*),/;
        let height_r = /"height":\s*([^\s,]*),/;
        let fmts = {};
        let data = document.head.innerHTML.match(/"media": \[\s[^\]]*\s\],/);
        if (!data)
            return;
        data = data[0].match(/\{[^}]*\}/g);
        data.forEach(it =>
            fmts[it.match(width_r)[1] + "x" + it.match(height_r)[1]] = it.match(url_r)[1]
        );
        injectPlayer(fmts);
    });

    function injectPlayer(fmts) {
        rmChildren(document.head);
        let vp = new VP(document.body);
        vp.srcs(fmts, {
            "higher/mp4": "1280x720",
            "high/mp4": "848x480",
            "medium/mp4": "640x360",
            "low/mp4": "301x232" // there is 300x220 too which is audio only
        });
        vp.props({
            controls: true,
            autoplay: autoPlay(true),
            preload: preLoad(),
            loop: isLoop()
        });
        vp.style({
            width: "100%",
            height: "100%"
        });
        vp.setup();
    }

    function fallback() {
        // Just fallback method if the first one didn't work
        let url_r = /"videoUri":\s*"([^"]*)"/;
        let url = (document.head.innerHTML.match(url_r) || ["", ""])[1];
        return url;
    }
}());
