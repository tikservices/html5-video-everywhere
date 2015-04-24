"use strict";
var match = [/https?:\/\/(www\.|beta\.)?facebook.com\/.*\/videos\/.*/];
var inject = [
    "facebook.js"
];
exports.match = match;
exports.inject = inject;
