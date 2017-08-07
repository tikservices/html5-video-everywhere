"use strict";

if (typeof browser === "undefined")
  var browser = chrome;

const ports = [];

function onMessage(msg, port) {
  console.log("New message:", msg);
  switch (msg.type) {
    case "inject":
      browser.storage.sync.get().then((opts) =>
        port.postMessage({
          "type": "options",
          "options": opts
        }));
      break;
    default:
      break;
  }
}

function onDisconnect(port) {}

browser.runtime.onConnect.addListener((port) => {
  console.log("[h5vew] New connection:", port.name);
  ports.push(port);
  port.onMessage.addListener(onMessage);
  port.onDisconnect.addListener(onDisconnect);
  browser.pageAction.show(port.sender.tab.id);
});
