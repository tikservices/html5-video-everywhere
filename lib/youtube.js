"use strict";
var YOUTUBE_FLASH_REGEX = /https?:\/\/(www.)?youtube.com\/v\/([^#?\/]*)/;
var YT_BIN_REGEX = /https:\/\/s.ytimg.com\/yts\/jsbin\/[^\/]*\/base.js/;
var YT_PLAYER_REGEX = /https?:\/\/s.ytimg.com\/yts\/jsbin\/[^\/]*\/html5player.js/;
var when = "start";
var match = ["*.www.youtube.com"];
var inject = [
    "LeanBackPlayer/js.player/leanbackPlayer.js",
    "LeanBackPlayer/js.player/leanbackPlayer.en.js",
    "common.js",
    "youtube-formats.js",
    "youtube.js"
];
var style = [
    "LeanBackPlayer/css.player/leanbackPlayer.default.css"
];
var redirect = [{
    src: /https?:\/\/(www.)?youtube.com\/v\/([^#?\/]*)/,
    funct: (_1, _2, v) => "https://www.youtube.com/embed/" + v
}];
var block = [/https?:\/\/s.ytimg.com\/yts\/jsbin\/[^\/]*\/html5player.js/];
exports.when = when;
exports.match = match;
exports.inject = inject;
exports.redirect = redirect;
exports.block = block;
exports.style = style;