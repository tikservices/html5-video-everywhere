/**
 * @file Extension backgroun script.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

/**
 * List of message exchange ports with other scripts.
 * @const {chrome.runtime.Port[]}
 * @private
 */
const ports = [];

/**
 * New message handler. Message can be from content-script, options_ui or
 * popup script.
 *
 * @param {Object} msg - Message object recived.
 * @param {chrome.runtime.Port} port - Message exchange port.
 * @private
 */
function onMessage(msg, port) {
  console.log("New message:", msg);
  switch (msg.type) {
    case "inject":
      chrome.storage.sync.get(null, (opts) =>
        port.postMessage({
          "type": "options",
          "options": opts,
        }));
      break;
    default:
      break;
  }
}

function onDisconnect(port) {}

chrome.runtime.onConnect.addListener((port) => {
  console.log("[h5vew] New connection:", port.name);
  ports.push(port);
  port.onMessage.addListener(onMessage);
  port.onDisconnect.addListener(onDisconnect);
  chrome.pageAction.show(port.sender.tab.id);
});
