"use strict";
var match = [/https?:\/\/(www.)dailymotion.com\/embed\/video\/.*/];
var inject = [
    "common.js",
    "dailymotion.js"
];
var when = "start";
exports.when = when;
exports.match = match;
exports.inject = inject;