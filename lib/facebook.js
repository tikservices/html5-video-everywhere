"use strict";
var match = [/https?:\/\/(www\.|beta\.)?facebook.com\/video.php\?.*/];
var inject = [
    "common.js",
    "facebook.js"
];
exports.match = match;
exports.inject = inject;