"use strict";

const ports = [];
let activeTab = browser.tabs.query({active: true, currentWindow: true});
activeTab.then(tab => {
  browser.tabs.sendMessage(tab[0].id, {msg: "I'm here"});
});

browser.runtime.onMessage.addListener((msg) => {
});

function onMessage(msg) {
  console.log("New message:", msg);
}
function onDisconnect(port) {
}

browser.runtime.onConnect.addListener((port) => {
  console.log("New port:", port);
  ports.push(port);
  port.onMessage.addListener(onMessage);
  port.onDisconnect.addListener(onDisconnect);
  browser.pageAction.show(port.sender.tab.id);
});
