/**
 * @file Extension backgroun script.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

const ports = [];

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


/*
function update(details) {
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.tabs.create({
      url: 'https://h5vew.tik.tn/'
    });
  }
}

chrome.runtime.onInstalled.addListener(update);
*/
