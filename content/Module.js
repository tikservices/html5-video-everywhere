"use strict";

class Module {
  constructor(name, redirect = [], block = []) {
    this.name = name;
    this.redirect = redirect;
    this.block = block;

    this.port = browser.runtime.connect({
      "name": "h5vew"
    });
    this.port.postMessage({
      "type": "inject",
      "module": this.name
    });
    this.port.onMessage.addListener((msg) => this.onMessage(msg));
    this.messageListeners = {};
  }

  start() {
    this.log("start()");
    if (this.options && !this.options.isDisabled()) {
      new Promise((resolve, reject) => resolve(this.onLoading()))
        .then(() => new Promise((resolve, reject) => {
          if (document.readyState != "loading") {
            resolve(this.onInteractive());
          } else {
            document.addEventListener("DOMContentLoaded", () => {
              resolve(this.onInteractive());
            });
          }
        }))
        .then(() => {
          if (document.readyState === "complete")
            this.onComplete();
          else
            document.addEventListener("load", () => this.onComplete());
        })
        .catch((err) => this.log("Error start():", err));
    } else {
      this.addMessageListener("options", (msg) => this.start());
    }
  }

  onLoading() {
    this.log("onLoading()");
  }

  onInteractive() {
    this.log("onInteractive()");
  }

  onComplete() {
    this.log("onComplete()");
  }

  onMessage(msg) {
    this.log("Message", msg);
    switch (msg.type) {
      case "options":
        this.options = new Options(msg.options, this.name);
        break;
      default:
        break;
    }
    for (const fn of(this.messageListeners[msg.type] || []))
      fn(msg);
  }

  addMessageListener(type, fn) {
    this.log("Add msg listener:", type);
    if (!this.messageListeners[type]) {
      this.messageListeners[type] = [];
    }
    this.messageListeners[type].push(fn);
  }
  onOptionChange(opt, val) {}

  getOption(opt) {}

  async setOption(opt, val) {}

  log(...args) {
    console.log("[h5vew:" + this.name + "]", ...args);
  }
}
