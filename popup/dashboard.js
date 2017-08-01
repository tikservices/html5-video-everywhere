"use strict";

document.addEventListener("click", (evt) => {
  switch (evt.target.id) {
    case "donate":
      break;
    case "report":
      break;
    case "options":
      browser.runtime.openOptionsPage();
      break;
    default:
      break;
  }
});
