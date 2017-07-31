"use strict";

let form = document.getElementById("options");

function saveOptions(e) {
  let options = {};
  for (const el of form.elements) {
    if (el.type === "checkbox")
      options[el.name] = el.checked;
    else
      options[el.name] = el.value;
  }
  browser.storage.sync.set(options);
  e.preventDefault();
  }

function changeOption(e) {
  let el = e.target;
  let val;
  if (el.type === "checkbox")
    val = el.checked;
  else
    val = el.value;
  console.log("[h5vew:options] Change", el.name, val);
  browser.storage.sync.set({[el.name] : val});
  e.preventDefault();
  }

function restoreOptions() {
  for (const el of form.elements) {
    browser.storage.sync.get(el.name).then((res) => {
      if (el.type === "checkbox") {
        el.checked = (res[el.name] !== undefined) ? res[el.name] : el.checked;
      } else {
        el.value = (res[el.name] !== undefined) ? res[el.name] : el.value;
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
form.addEventListener("submit", saveOptions)
form.addEventListener("change", changeOption)
