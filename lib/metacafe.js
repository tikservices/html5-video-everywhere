"use strict";
var match = [/https?:\/\/www.metacafe.com\/watch\/.*/];
var inject = [
    "common.js",
    "metacafe.js"
];
var when = "start";
exports.when = when;
exports.match = match;
exports.inject = inject;