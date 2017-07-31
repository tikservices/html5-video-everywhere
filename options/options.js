"use strict";

let form = document.getElementById("options");

function saveOptions(e) {
  let options = {};
  for (const el of form.elements) {
    options[el.name] = el.value;
  }
  browser.storage.sync.set(options);
  e.preventDefault();
  }

function restoreOptions() {
  for (const el of form.elements) {
    browser.storage.sync.get(el.name)
    .then((res) => {
      el.value = res[el.name] || el.dataset.default;
    })
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
form.addEventListener("submit", saveOptions)
