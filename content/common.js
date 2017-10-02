/**
 * @file Common functions and helpers.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

/**
 * Send setClipboard message to thebackground script with text to add to
 * clipboard.
 *
 * @param {string} text - Text to add to clipboard.
 *
 * @deprecated
 */
export function setClipboard(text) {
  self.port.emit("setClipboard", text);
}

export function createNode(type, prprt, style, data) {
  let node = document.createElement(type);
  if (prprt) Object.keys(prprt).forEach((p) => node[p] = prprt[p]);
  if (style) Object.keys(style).forEach((s) => node.style[s] = style[s]);
  if (data) Object.keys(data).forEach((d) => node.dataset[d] = data[d]);
  return node;
};

export function asyncGet(url, headers = {}, mimetype = null) {
  return fetch(url, {
    headers: headers,
  }).then((res) => {
    if (res.ok) return res.text();
    else return Promise.reject();
  });
};

export function rmChildren(prnt) {
  while (prnt && prnt.firstChild) {
    prnt.removeChild(prnt.firstChild);
  }
};
