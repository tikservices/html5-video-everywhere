/* jshint esnext:true, node:true*/
"use strict";
const {
    Cc, Ci, Cr
} = require("chrome");
const {
    add, remove
} = require("sdk/util/array");
const data = require("sdk/self").data;
const pageMod = require("sdk/page-mod");
const events = require("sdk/system/events");
const utils = require("sdk/window/utils");
var prefs = require("sdk/simple-prefs").prefs;
//  list of current workers
const workers = [];
const drivers = [
    require("./youtube.js"),
    require("./vimeo.js"),
    require("./dailymotion.js"),
    require("./break.js"),
    require("./metacafe.js"),
    require("./facebook.js")
];

for (let driver of drivers) {
    if (driver.match === void(0))
        continue;
    pageMod.PageMod({
        include: driver.match,
        contentScriptFile: driver.inject.map(i => data.url(i)),
        contentScriptWhen: driver.when || "ready",
        onAttach: onWorkerAttach
    });
}

function listener(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var url = event.subject.URI.spec;
    for (let driver of drivers) {
        for (let redirect of(driver.redirect || [])) {
            if (redirect.src.test(url)) {
                channel.redirectTo(Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(
                    String.replace(url, redirect.src, redirect.funct),
                    null,
                    null));
                console.log("Redirect:", url);
                return;
            }
        }
        for (let block of(driver.block || [])) {
            if (block.test(url)) {
                channel.cancel(Cr.NS_BINDING_ABORTED);
                console.log("Block:", url);
                return;
            }
        }
    }
}

//on Addon prefernces change, send the changes to content-script
require("sdk/simple-prefs").on("", function prefChangeHandler(pref) {
    if (pref === "volume" && prefs.volume > 100)
        prefs.volume = 100;
    else if (pref === "volume" && prefs.volume < 0)
        prefs.volume = 0;
    else
        workersPrefHandler(pref);
});

function workersPrefHandler(pref) {
    for (let worker of workers)
        worker.port.emit("prefChanged", {
            name: pref,
            value: prefs[pref]
        });
}

function onWorkerAttach(worker) {
    console.log("onAttach", worker);
    //send current Addon preferences to content-script
    let _prefs = {};
    for (let pref in prefs)
        _prefs[pref] = prefs[pref];
    worker.port.emit("preferences", _prefs);
    add(workers, worker);
    worker.on("detach", function(e) {
        remove(workers, this);

    });
}
exports.main = function() {
    events.on("http-on-modify-request", listener);
};
exports.onUnload = function(reason) {
    events.off("http-on-modify-request", listener);
};