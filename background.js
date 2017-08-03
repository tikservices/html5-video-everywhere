"use strict";

if (typeof browser === "undefined")
  var browser = chrome;

const ports = [];
let activeTab = browser.tabs.query({
  active: true,
  currentWindow: true
});
activeTab.then(tab => {
  browser.tabs.sendMessage(tab[0].id, {
    msg: "I'm here"
  });
});

browser.runtime.onMessage.addListener((msg) => {});

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
