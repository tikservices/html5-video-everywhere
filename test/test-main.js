"use strict";
const id = require("sdk/self").id;
var main = require("./main.js");
var youtube = require("./youtube.js");
const {
    testPageMod, handleReadyState
} = require("./main-helpers.js");
const prefs = require("sdk/simple-prefs").prefs;
const URI = require("sdk/url").URL;

const {
    Cc, Ci, Cr
} = require("chrome");
Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService)
    .getBranch("extensions." + id + ".sdk.console").setCharPref("logLevel", "error");
exports["test main"] = function(assert) {
    assert.pass("Unit test running!");
};
exports["test main async"] = function(assert, done) {
    assert.pass("async Unit test running!");
    done();
};


let tests = [{
    /*
    URL: "youtube.com/embed/ltun92DfnPY",
    type: "video/webm; codecs=\"vp8.0, vorbis\"",
    cdc: 0,
    qlt: 2,
    AUTOPLAY: 0,
    PRELOAD: 0,
    autoplay: false,
    preload: "metadata",
}, {*/
    URL: "youtube.com/watch?v=ltun92DfnPY",
    type: "video/mp4; codecs=\"avc1.64001F, mp4a.40.2\"",
    cdc: 1,
    qlt: 1,
    AUTOPLAY: 2,
    PRELOAD: 2,
    autoplay: true,
    preload: "metadata",
    VOL: 50,
    volume: 0.5
        //pathname:"/fdgdg/dgdg.mp4"
        /*
        }, {
            URL: "youtube.com/v/ltun92DfnPY",
            type: "video/mp4; codecs=\"avc1.42001E, mp4a.40.2\"",
            cdc: 1,
            qlt: 2,
            AUTOPLAY: 1,
            PRELOAD: 1,
            autoplay: true,
            preload: "auto"
                //pathname:"/lj/mlj.mp4"
        */
}];
tests.forEach((test, i) => {
    exports["test" + i] = testPageMod(test.URL, (win, assert, done) => {
            const equal = (el1, el2, desc) => {
                console.log("TEST", desc, el1 === el2);
                assert.equal(el1, el2, desc);
            };
            var video = win.document.getElementsByTagName("video");
            equal(video.length, 1, "Video Element Found");
            if (video.length < 1) return;
            video = video[0];
            if (test.type) {
                let source = video.getElementsByTagName("source");
                equal(source.length, 1, "Source Element Found");
                if (source.length < 1) return;
                source = source[0];
                //equal(URI(source.src, null).pathname, test.pathname, "Video Src Test");
                equal(source.type, test.type, "Video Type Test");
            }
            if (test.VOL) {
                prefs.volume = test.VOL;
                equal(video.volume, test.volume, "Volume Test");
            }
            equal(video.autoplay, test.autoplay, "AutoPlay Test");
            equal(video.preload, test.preload, "PreLoad Test");
            done();
        }, () => {
            prefs.autoplay = test.AUTOPLAY;
            prefs.preload = test.PRELOAD;
        },
        10000);
});

require("sdk/test").run(exports);