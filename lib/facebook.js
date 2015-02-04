"use strict";
var match = [/https?:\/\/(www\.|beta\.)?facebook.com\/video.php\?.*/];
var inject = [
    "facebook.js"
];
exports.match = match;
exports.inject = inject;