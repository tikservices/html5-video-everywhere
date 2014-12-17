/* jshint esnext: true */
/* globals self */
//This Addons Preferences
var OPTIONS = {};
//Youtube video formats sorted as preferred
var PREF_FORMATS = [];
// will be defined on youtube.js later
var prefChangeHandler = function() {};
(function() {
    "use strict";
    self.port.on("preferences", function(prefs) {
        OPTIONS = prefs;
        generatePrefFormats();
    });

    function generatePrefFormats() {
        var FORMT = [
            [
                "43",
                // 320p on webm
                "22" //720p is not availbale on webm
            ],
            [
                "18",
                // 320p on mp4
                "22" // 720p on mp3
            ]
        ];
        var x = OPTIONS.preferredCodec === 0 ? {
            i: 0,
            n: 1
        } : {
            i: 1,
            n: -1
        };
        var y = OPTIONS.preferredQuality === 0 ? {
            i: 0,
            n: 1
        } : {
            i: 1,
            n: -1
        };
        PREF_FORMATS = [];
        PREF_FORMATS.push(FORMT[x.i][y.i]);
        PREF_FORMATS.push(FORMT[x.i + x.n][y.i]);
        PREF_FORMATS.push(FORMT[x.i][y.i + y.n]);
        PREF_FORMATS.push(FORMT[x.i + x.n][y.i + y.n]);
    }
    self.port.on("prefChanged", function(pref) {
        OPTIONS[pref.name] = pref.value;
        if (pref.name === "preferredCodec" || pref.name === "preferredQuality")
            generatePrefFormats();
        prefChangeHandler(pref);
    });
}());
var FORMATS = {
    "18": {
        container: "mp4",
        resolution: "360p",
        type: "video/mp4; codecs=\"avc1.42001E, mp4a.40.2\""
    },
    "22": {
        container: "mp4",
        resolution: "720p",
        type: "video/mp4; codecs=\"avc1.64001F, mp4a.40.2\""
    },
    "43": {
        container: "webm",
        resolution: "360p",
        type: "video/webm; codecs=\"vp8.0, vorbis\""
    }
};
/*
 * STILL NOT SUPPORTED FORMATS
 */
var FORMATS_3D = {
    "82": {
        container: "mp4",
        resolution: "360p"
    },
    "83": {
        container: "mp4",
        resolution: "240p"
    },
    "84": {
        container: "mp4",
        resolution: "720p"
    },
    "85": {
        container: "mp4",
        resolution: "1080p"
    },
    "100": {
        container: "webm",
        resolution: "360p"
    },
    "101": {
        container: "webm",
        resolution: "360p"
    },
    "102": {
        container: "webm",
        resolution: "720p"
    }
};
var FORMATS_DASH_VIDEO = {
    "133": {
        container: "mp4",
        resolution: "240p"
    },
    "134": {
        container: "mp4",
        resolution: "360p"
    },
    "135": {
        container: "mp4",
        resolution: "480p"
    },
    "136": {
        container: "mp4",
        resolution: "720p"
    },
    "137": {
        container: "mp4",
        resolution: "1080p"
    },
    "160": {
        container: "mp4",
        resolution: "144p"
    },
    "264": {
        container: "mp4",
        resolution: "1440p"
    }
};
var FORMATS_DASH_AUDIO = {
    "139": {
        container: "mp4",
        audioEncoding: "aac",
        audioBitrate: 48
    },
    "140": {
        container: "mp4",
        audioEncoding: "aac",
        audioBitrate: 128
    },
    "141": {
        container: "mp4",
        audioEncoding: "aac",
        audioBitrate: 256
    },
    "171": {
        container: "webm",
        audioBitrate: 128
    },
    "172": {
        container: "webm",
        audioBitrate: 192
    }
};
var FORMAT_LIVE_STREAM = {
    "242": {
        container: "webm",
        resolution: "240p"
    },
    "243": {
        container: "webm",
        resolution: "360p"
    },
    "244": {
        container: "webm",
        resolution: "480p"
    },
    "247": {
        container: "webm",
        resolution: "720p"
    },
    "248": {
        container: "webm",
        resolution: "1080p"
    }
};