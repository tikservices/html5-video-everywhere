"use strict";

let form = document.getElementById("options");
let options;
const elements = Array.filter(form.elements, (e) => e.type !== "submit");

function saveOptions(e) {
  for (const el of elements) {
    if (el.type === "checkbox")
      options.set(el.name, el.checked);
    else
      options.set(el.name, el.checked);
  }
  browser.storage.sync.set(options.getAll());
  e.preventDefault();
}

function changeOption(e) {
  let el = e.target;
  if (el.type === "checkbox")
    options.set(el.name, el.checked);
  else
    options.set(el.name, el.value);
  console.log("[h5vew:options] Change", el.name, options.get(el.name));
  browser.storage.sync.set({
    [el.name]: options.get(el.name)
  });
  e.preventDefault();
}

function restoreOptions() {
  browser.storage.sync.get().then((res) => {
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

document.addEventListener('DOMContentLoaded', restoreOptions);
form.addEventListener("submit", saveOptions)
form.addEventListener("change", changeOption)
