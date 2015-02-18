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
const pageMods = {};
const common = require("./common");
const allDrivers = {
    "facebook": require("./facebook"),
    "vimeo": require("./vimeo"),
    "dailymotion": require("./dailymotion"),
    "break": require("./break"),
    "metacafe": require("./metacafe"),
    "youtube": require("./youtube")
};
var disabledDrivers = prefs.disable.split(",").map(i => i.trim());
const drivers = (Array.isArray(staticArgs.drivers) ?
    staticArgs.drivers :
    Object.keys(allDrivers)).filter(i =>
    disabledDrivers.indexOf(i) === -1
);


const onWorkerAttach = (drvName, listen) => (worker) => {
    logify("onAttach", worker);
    //send current Addon preferences to content-script
    let _prefs = {};
    for (let pref in prefs)
        _prefs[pref] = prefs[pref];
    _prefs.driver = drvName;
    _prefs.production = staticArgs.production;
    worker.port.emit("preferences", _prefs);
    add(workers, worker);
    worker.port.on("prefChang", (pref) =>
        prefs[pref.name] = pref.val);
    worker.port.on("disable", () => {
        disabledDrivers.push(drvName);
        prefs.disable = disabledDrivers.join(",");
        remove(drivers, drvName);
        pageMods[drvName].destroy();
    });
    for (let evt in listen) {
        logify("Add listener:", evt);
        worker.port.on(evt, (obj) => {
            listen[evt](obj, worker);
        });
    }
    worker.on("detach", function(e) {
        remove(workers, this);

    });
};
for (let drvName of drivers) {
    var driver = allDrivers[drvName];
    if (driver.match === void(0))
        continue;
    var scripts, styles;
    scripts = common.inject.concat(driver.inject)
        .map(i => data.url(i));
    styles = common.style.concat(driver.style || [])
        .map(i => data.url(i));
    pageMods[drvName] = pageMod.PageMod({
        include: driver.match,
        contentScriptFile: scripts,
        contentStyleFile: styles,
        contentScriptWhen: driver.when || "ready",
        onAttach: onWorkerAttach(drvName, driver.listen)
    });
}

function listener(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var url = event.subject.URI.spec;
    for (let drvName of drivers) {
        var driver = allDrivers[drvName];
        for (let redirect of(driver.redirect || [])) {
            if (redirect.src.test(url)) {
                channel.redirectTo(Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(
                    String.replace(url, redirect.src, redirect.funct),
                    null,
                    null));
                logify("Redirect:", url);
                return;
            }
        }
        for (let block of(driver.block || [])) {
            if (block.test(url)) {
                channel.cancel(Cr.NS_BINDING_ABORTED);
                logify("Block:", url);
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

function logify(...args) {
    if (staticArgs.production)
        return;
    args.unshift("[CORE]");
    dump(args.join(" ") + "\n");
}

exports.main = () => {
    events.on("http-on-modify-request", listener);
};
exports.onUnload = function(reason) {
    events.off("http-on-modify-request", listener);
};