"use strict";
var match = [/https?:\/\/(www\.|beta\.)?facebook.com\/video.php\?.*/];
var inject = [
    "LeanBackPlayer/js.player/leanbackPlayer.js",
    "LeanBackPlayer/js.player/leanbackPlayer.en.js",
    "common.js",
    "video-player.js",
    "facebook.js"
];
var style = [
    "LeanBackPlayer/css.player/leanbackPlayer.default.css"
];
exports.match = match;
exports.inject = inject;
exports.style = style;