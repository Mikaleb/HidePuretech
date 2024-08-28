declare const chrome: any;
import { AppState } from "./types/state"; // Import the state type

// I want to hide all the elements on the page that have the word "PURETECH" in them

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle the message
  sendResponse({ status: "received" });
});

const hideElements = () => {
  console.log("bomboloblol");

  const elements = document.querySelectorAll("a");

  // chrome.storage.sync.get("isOn", (results: { isOn: any }) => {
  //   console.debug("🚀 ~ results.isOn", results.isOn);
  // });

  elements.forEach((element) => {
    // if in the a, there is a div with any child that has PURETECH in it, hide the a

    const childsDiv = element.querySelectorAll("div");

    childsDiv.forEach((child) => {
      console.debug("🚀 ~ childsDiv.forEach ~ child:", child);
      if (child.textContent.includes("PURETECH")) {
        element.style.display = "none";
        // fix for lacentrale : if parent div with class "searchCard", hide too
        if (element.parentElement.className === "searchCard") {
          element.parentElement.style.display = "none";
        }
      }
    });
  });
};

hideElements();
