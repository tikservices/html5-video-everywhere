"use strict";
var when = "start";
var match = [/https?:\/\/vimeo.com\/.+/,
    /https?:\/\/player.vimeo.com\/video.*/
];
var inject = [
    "LeanBackPlayer/js.player/leanbackPlayer.js",
    "LeanBackPlayer/js.player/leanbackPlayer.en.js",
    "common.js",
    "vimeo.js"
];
var style = [
    "LeanBackPlayer/css.player/leanbackPlayer.default.css"
];
exports.when = when;
exports.match = match;
exports.inject = inject;
exports.style = style;