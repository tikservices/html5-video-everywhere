/**
 * @file Extension page popup script.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */


/* TODO: Show module special options on popup
import Options from "../content/Options.js";

let options;
const form = document.getElementById("form");
const elements = Array.from(form.elements).filter((e) =>
  e.type !== "submit" && e.type !== "button"
);
*/

function onClick(evt) {
  switch (evt.target.name) {
    case "donate":
      chrome.tabs.create({
        active: true,
        url: "https://www.paypal.me/lejenome",
      });
      break;
    case "report":
      chrome.tabs.create({
        active: true,
        url: "https://github.com/lejenome/html5-video-everywhere/issues/",
      });
      break;
    case "about":
      chrome.tabs.create({
        active: true,
        url: "https://h5vew.tik.tn/",
      });
      break;
    case "options":
      chrome.runtime.openOptionsPage();
      break;
    default:
      break;
  }
}

function restoreOptions() {
  chrome.storage.sync.get(null, (res) => {
    // options = new Options(res);
  });
}

function main() {
  let manifest = chrome.runtime.getManifest();
  document.getElementById("name").textContent = manifest.name;
  document.getElementById("version").textContent = manifest.version;
  document.addEventListener("click", onClick);
  restoreOptions();
}

main();
