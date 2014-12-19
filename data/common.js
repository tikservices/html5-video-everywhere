/* global OPTIONS:true, onPrefChange:true */
// common functions
"use strict";

//This Addons Preferences
var OPTIONS = {};
var onPrefChange = [];
self.port.on("preferences", function(prefs) {
    OPTIONS = prefs;
    onPrefChange.map(f => f());
});

self.port.on("prefChanged", function(pref) {
    OPTIONS[pref.name] = pref.value;
    onPrefChange.map(f => f(pref.name));
});

function createNode(type, obj, data, style) {
    logify("createNode", type, obj);
    var node = document.createElement(type);
    if (obj)
        for (var opt in obj)
            if (obj.hasOwnProperty(opt))
                node[opt] = obj[opt];
    if (data)
        for (var el in data)
            if (data.hasOwnProperty(el))
                node.dataset[el] = data[el];
    if (style)
        for (var st in style)
            if (style.hasOwnProperty(st))
                node.style[st] = style[st];
    return node;
}

function asyncGet(url, headers, mimetype) {
    logify("asyncGet", url);
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        /* jshint forin:false */
        if (headers)
            for (var header in headers)
                xhr.setRequestHeader(header, headers[header]);
        if (mimetype && xhr.overrideMimeType)
            xhr.overrideMimeType(mimetype);
        xhr.onload = function() {
            if (this.status !== 200) {
                reject(this.status);
                return;
            }
            resolve(this.responseText);
        };
        xhr.onerror = function() {
            reject();
        };
        xhr.send();
    });
}

function logify(...args) {
    console.log.apply(console, args.map(s => JSON.stringify(s, null, 2)));
}

function onReady(f) {
    //TODO: document readyState is "loading" (and DOMECotentLoaded) even DOM elements are
    //accessible
    try {
        if (document.readyState !== "loading")
            f();
        else
            document.addEventListener("DOMContentLoaded", f);
    } catch (e) {
        console.error("Exception", e.lineNumber, e.columnNumber, e.message, e.stack);
    }
}