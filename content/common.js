/* global createNode:true */
/* global rmChildren:true */
/* global setClipboard:true */
// the following jshint global rule is only because jshint support for ES6 arrow
// functions is limited
/* global wrapper:true, args:true, auto:true, lp:true */
"use strict";

// set it to false if the module uses custom listener
// const HANDLE_VOL_PREF_CHANGE = true;
// self.port.on("preferences", function(prefs) {
//     OPTIONS = prefs;
//     if (init)
//         init();
//     onPrefChange.forEach(f => f());
// });
//
// self.port.on("prefChanged", function(pref) {
//     OPTIONS[pref.name] = pref.value;
//     if (pref.name === "volume" && HANDLE_VOL_PREF_CHANGE === true)
//         Array.forEach(document.getElementsByTagName("video"), el => {
//             el.volume = OPTIONS.volume / 100;
//         });
//     onPrefChange.forEach(f => f(pref.name));
// });
const setClipboard = (text) => self.port.emit("setClipboard", text);
const createNode = (type, prprt, style, data) => {
  let node = document.createElement(type);
  if (prprt) Object.keys(prprt).forEach(p => node[p] = prprt[p]);
  if (style) Object.keys(style).forEach(s => node.style[s] = style[s]);
  if (data) Object.keys(data).forEach(d => node.dataset[d] = data[d]);
  return node;
};

const asyncGet = (url, headers = {}, mimetype = null) => {
  return fetch(url, {
    headers: headers,
  }).then((res) => {
    if (res.ok) return res.text();
    else return Promise.reject();
  });
};

const rmChildren = (prnt) => {
  while (prnt && prnt.firstChild)
    prnt.removeChild(prnt.firstChild);
};
