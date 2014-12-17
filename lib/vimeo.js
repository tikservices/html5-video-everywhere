"use strict";
var when = "start";
var match = [/https?:\/\/vimeo.com\/[\d]+/];
var inject = [
    "common.js",
    "vimeo.js"
];
exports.when = when;
exports.match = match;
exports.inject = inject;