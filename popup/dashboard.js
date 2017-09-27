"use strict";

let options;
const form = document.getElementById("form");
const elements = Array.from(form.elements).filter((e) => {
  e.type !== "submit" && e.type !== "button"
});

function onClick(evt) {
  switch (evt.target.name) {
    case "donate":
      browser.tabs.create({
        active: true,
        url: "https://www.paypal.me/lejenome"
      });
      break;
    case "report":
      browser.tabs.create({
        active: true,
        url: "https://github.com/lejenome/html5-video-everywhere/issues/"
      });
      break;
    case "about":
      browser.tabs.create({
        active: true,
        url: "https://h5vew.tik.tn/"
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
