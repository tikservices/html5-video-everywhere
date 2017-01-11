"use strict";
var match = [/https?:\/\/(www\.|beta\.)?facebook.com\/(.*\/videos\/.*|video.php\?.*)/];
var inject = [
    "facebook.js"
];
exports.type = "site";
exports.name = "facebook";
exports.match = match;
exports.inject = inject;