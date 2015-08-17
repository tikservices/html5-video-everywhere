// common part between all drivers.
var prefs = require("sdk/simple-prefs").prefs;
var inject = [],
    style = [];
inject = inject.concat([
    "common.js",
    "video-player.js"
]);
/*
if (prefs.player === 1) {
    // current player is leanBackPlayer
    inject = [].concat([
        "LeanBackPlayer/js.player/leanbackPlayer.js",
        "LeanBackPlayer/js.player/leanbackPlayer.en.js",
    ], inject);
    style.push("LeanBackPlayer/css.player/leanbackPlayer.default.css");
}
*/
exports.type = "site";
exports.name = "common";
exports.inject = inject;
exports.style = style;