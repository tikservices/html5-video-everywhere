"use strict";
var match = [/https?:\/\/www.metacafe.com\/watch\/.*/,
    /https?:\/\/www.metacafe.com\/[^\/]+\/?/
];
var inject = [
    "metacafe.js"
];
var when = "start";
exports.when = when;
exports.match = match;
exports.inject = inject;