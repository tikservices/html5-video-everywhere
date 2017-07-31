"use strict";

class Module {
  constructor(name, redirect = [], block = []) {
    this.name     = name;
    this.redirect = redirect;
    this.block    = block;

    this.port = browser.runtime.connect({"name" : "h5vew"});
    this.port.postMessage({"type" : "inject", "module" : this.name});
    this.port.onMessage.addListener((msg) => this.onMessage(msg));
  }

  start() {
    this.log("start()");
    new Promise((resolve, reject) => resolve(this.onLoading()))
        .then(() => new Promise((resolve, reject) => {
                if (document.readyState != "loading") {
                  resolve(this.onInteractive());
                } else {
                  document.addEventListener("DOMContentLoaded", () => {
                    resolve(() => this.onInteractive());
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

  onMessage(msg) {}

  onOptionChange(opt, val) {}

  getOption(opt) {}

  setOption(opt, val) {}

  log(...args) {
    console.log("[h5vew:" + this.name + "]", ...args);
  }
}
