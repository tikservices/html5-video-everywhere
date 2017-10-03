/**
 * @file Common functions and helpers.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 * @module
 */

/**
 * Send setClipboard message to thebackground script with text to add to
 * clipboard.
 *
 * @param {string} text - Text to add to clipboard.
 *
 * @deprecated Not ported to WebExtension api yet.
 */
export function setClipboard(text) {
  self.port.emit("setClipboard", text);
}

/**
 * Create new HTML element.
 *
 * @param {string} tag - Element tag name
 * @param {Object} properties - Mapping of element properties and its values
 * @param {Object} styles - Mapping of element styles to apply
 * @param {Object} dataset - Mapping of element data set.
 *
 * @return {HTMLElement} The created element.
 */
export function createNode(tag, properties, styles, dataset) {
  let node = document.createElement(tag);
  if (properties) Object.keys(properties).forEach((p) => node[p] = properties[p]);
  if (styles) Object.keys(styles).forEach((s) => node.style[s] = styles[s]);
  if (dataset) Object.keys(dataset).forEach((d) => node.dataset[d] = dataset[d]);
  return node;
};

/**
 * Wrapper around fetch api to return the URL fetched content as text
 *
 * @param {string} url - URL to fetch its content.
 * @param {Object} headers - Headers to add to the fetch request.
 *
 * @return {Promise} Fetch promise with the response text as argument on
 *                   success
 */
export function asyncGet(url, headers = {}) {
  return fetch(url, {
    headers: headers,
  }).then((res) => {
    if (res.ok) return res.text();
    else return Promise.reject();
  });
};

/**
 * Remove HTML element all child elements
 *
 * @param {HTMLElement} parent - HTML element to remove it children
 */
export function rmChildren(parent) {
  while (parent && parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};
