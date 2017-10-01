/**
 * @file Common functions and helpers.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */
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
export const setClipboard = (text) => self.port.emit("setClipboard", text);
export const createNode = (type, prprt, style, data) => {
  let node = document.createElement(type);
  if (prprt) Object.keys(prprt).forEach((p) => node[p] = prprt[p]);
  if (style) Object.keys(style).forEach((s) => node.style[s] = style[s]);
  if (data) Object.keys(data).forEach((d) => node.dataset[d] = data[d]);
  return node;
};

export const asyncGet = (url, headers = {}, mimetype = null) => {
  return fetch(url, {
    headers: headers,
  }).then((res) => {
    if (res.ok) return res.text();
    else return Promise.reject();
  });
};

export const rmChildren = (prnt) => {
  while (prnt && prnt.firstChild) {
    prnt.removeChild(prnt.firstChild);
  }
};
