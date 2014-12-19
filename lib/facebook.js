"use strict";
var match = [/https?:\/\/(www.|beta.)?facebook.com\/video.php\?.*/];
var inject = [
    "common.js",
    "facebook.js"
];
exports.when = "start";
exports.match = match;
exports.inject = inject;