/**
 * @file Extension options ui script.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

import Options from '../content/Options.js';

let options;
const form = document.getElementById("options");
const elements = Array.from(form.elements)
  .filter((e) => e.type !== "submit" && e.type !== "button");

function saveOptions(e) {
  for (const el of elements) {
    if (el.type === "checkbox") {
      options.set(el.name, el.checked);
    } else {
      options.set(el.name, el.checked);
    }
  }
  chrome.storage.sync.set(options.getAll());
  e.preventDefault();
}

function changeOption(e) {
  let el = e.target;
  if (el.type === "checkbox") {
    options.set(el.name, el.checked);
  } else {
    options.set(el.name, el.value);
  }
  console.log("[h5vew:options] Change", el.name, options.get(el.name));
  chrome.storage.sync.set({
    [el.name]: options.get(el.name),
  });
  e.preventDefault();
}

function restoreOptions() {
  chrome.storage.sync.get(null, (res) => {
    options = new Options(res);
    for (const el of elements) {
      if (el.type === "checkbox") {
        el.checked = options.get(el.name);
      } else {
        el.value = options.get(el.name);
      }
    }
  });
}

restoreOptions();
form.addEventListener("submit", saveOptions);
form.addEventListener("change", changeOption);
