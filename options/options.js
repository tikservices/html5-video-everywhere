"use strict";

let options;
const form = document.getElementById("options");
const elements = Array.from(form.elements)
  .filter(e => e.type !== "submit" && e.type !== "button");

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

restoreOptions();
form.addEventListener("submit", saveOptions)
form.addEventListener("change", changeOption)
