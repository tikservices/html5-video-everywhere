"use strict";

class Module {
  constructor(name, redirect = [], block = []) {
    this.name = name;
    this.redirect = redirect;
    this.block = block;

    this.port = browser.runtime.connect({"name": "h5vew"});
    this.port.postMessage({"type": "inject"});
    this.port.onMessage.addListener((msg) => this.onMessage(msg));

    new Promise(() => this.onLoading())
      .then(() => new Promise((resolve, reject) => {
      if (document.readyState === "interactive")
        resolve(this.onInteractive());
      else
        document.addEventListener("DOMContentLoaded", () => {
          resolve(() => this.onInteractive());
        });
    })).then(() => {
      if (document.readyState === "complete")
        this.onComplete();
      else
        document.addEventListener("load", () => this.onComplete());
    });
  }

  onLoading() {
  }

  onInteractive() {
  }

  onComplete() {
  }

  onMessage(msg) {
  }

  onOptionChange(opt, val) {
  }

  getOption(opt) {
  }

  setOption(opt, val) {
  }
}
