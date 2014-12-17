"use strict";
var YOUTUBE_FLASH_REGEX = /https?:\/\/(www.)?youtube.com\/v\/([^#?\/]*)/;
var YT_BIN_REGEX = /https:\/\/s.ytimg.com\/yts\/jsbin\/[^\/]*\/base.js/;
var YT_PLAYER_REGEX = /https?:\/\/s.ytimg.com\/yts\/jsbin\/[^\/]*\/html5player.js/;
var when = "start";
var match = ["*.www.youtube.com"];
var inject = [
    "common.js",
    "youtube-formats.js",
    "youtube.js"
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