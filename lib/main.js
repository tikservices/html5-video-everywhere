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
const staticArgs = require("sdk/system").staticArgs;
const utils = require("sdk/window/utils");
var prefs = require("sdk/simple-prefs").prefs;
//  list of current workers
const workers = [];

const drivers = [];
const common = require("./common");
if (Array.isArray(staticArgs.drivers)) {
    console.log("[CORE] Loading Custom Drivers: ", staticArgs.drivers.join());
    staticArgs.drivers.forEach(i => {
        drivers.push(require("./" + i));
    });
} else {
    [
        require("./facebook"),
        require("./vimeo"),
        require("./dailymotion"),
        require("./break"),
        require("./metacafe"),
        require("./youtube")
    ].forEach(i => drivers.push(i));
}


const onWorkerAttach = (listen) => (worker) => {
    console.log("[CORE] onAttach", worker);
    //send current Addon preferences to content-script
    let _prefs = {};
    for (let pref in prefs)
        _prefs[pref] = prefs[pref];
    worker.port.emit("preferences", _prefs);
    add(workers, worker);
    for (let evt in listen) {
        console.log("[CORE] Add listener:", evt);
        worker.port.on(evt, (obj) => {
            listen[evt](obj, worker);
        });
    }
    worker.on("detach", function(e) {
        remove(workers, this);

    });
};
for (let driver of drivers) {
    if (driver.match === void(0))
        continue;
    var scripts, styles;
    scripts = common.inject.concat(driver.inject)
        .map(i => data.url(i));
    styles = common.style.concat(driver.style || [])
        .map(i => data.url(i));
    pageMod.PageMod({
        include: driver.match,
        contentScriptFile: scripts,
        contentStyleFile: styles,
        contentScriptWhen: driver.when || "ready",
        onAttach: onWorkerAttach(driver.listen)
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
                console.log("[CORE] Redirect:", url);
                return;
            }
        }
        for (let block of(driver.block || [])) {
            if (block.test(url)) {
                channel.cancel(Cr.NS_BINDING_ABORTED);
                console.log("[CORE] Block:", url);
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

exports.main = () => {
    events.on("http-on-modify-request", listener);
};
exports.onUnload = function(reason) {
    events.off("http-on-modify-request", listener);
};