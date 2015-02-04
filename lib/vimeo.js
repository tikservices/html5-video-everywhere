"use strict";
var when = "start";
var match = [/https?:\/\/vimeo.com\/.+/,
    /https?:\/\/player.vimeo.com\/video.*/
];
var inject = [
    "vimeo.js"
];
exports.when = when;
exports.match = match;
exports.inject = inject;