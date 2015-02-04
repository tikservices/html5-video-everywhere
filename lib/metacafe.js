"use strict";
var match = [/https?:\/\/www.metacafe.com\/watch\/.*/,
    /https?:\/\/www.metacafe.com\/[^\/]+\/?/
];
var inject = [
    "LeanBackPlayer/js.player/leanbackPlayer.js",
    "LeanBackPlayer/js.player/leanbackPlayer.en.js",
    "common.js",
    "video-player.js",
    "metacafe.js"
];
var style = [
    "LeanBackPlayer/css.player/leanbackPlayer.default.css"
];
var when = "start";
exports.when = when;
exports.match = match;
exports.inject = inject;
exports.style = style;