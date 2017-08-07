"use strict";

let options;
const form = document.getElementById("form");
const elements = Array.from(form.elements).filter((e) => {
  e.type !== "submit" && e.type !== "button"
});

function onClick(evt) {
  switch (evt.target.name) {
    case "donate":
      break;
    case "report":
      break;
    case "about":
      browser.tabs.create({
        active: true,
        url: "https://addons.mozilla.org/en-US/firefox/addon/html5-video-everywhere/"
      });
      break;
    case "options":
      browser.runtime.openOptionsPage();
      break;
    default:
      break;
  }
}

function restoreOptions() {
  browser.storage.sync.get().then((res) => {
    options = new Options(res);
  });
}

function main() {
  let manifest = browser.runtime.getManifest();
  document.getElementById("name").textContent = manifest.name;
  document.getElementById("version").textContent = manifest.version;
  document.addEventListener("click", onClick);
  restoreOptions();
}

main();
