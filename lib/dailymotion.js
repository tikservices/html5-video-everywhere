"use strict";
var match = [/https?:\/\/(www.)dailymotion.com\/embed\/video\/.*/];
var inject = [
    "LeanBackPlayer/js.player/leanbackPlayer.js",
    "LeanBackPlayer/js.player/leanbackPlayer.en.js",
    "common.js",
    "video-player.js",
    "dailymotion.js"
];
var style = [
    "LeanBackPlayer/css.player/leanbackPlayer.default.css"
];
var when = "start";
exports.when = when;
exports.match = match;
exports.inject = inject;
exports.style = style;