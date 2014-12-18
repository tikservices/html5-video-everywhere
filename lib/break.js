"use strict";
var match = [/https?:\/\/www.break.com\/embed\/.*/];
var inject = [
    "common.js",
    "break.js"
];
var block = [/s.brkmd.com\/combres.axd\/embedJs\/121614/];
var when = "start";
exports.when = when;
exports.match = match;
exports.inject = inject;
exports.block = block;