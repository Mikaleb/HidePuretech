import { initialState } from "./store/initialState";
import { AppState } from "./types/state";

declare const chrome: any;

// I want to hide all the elements on the page that have the word "PURETECH" in them

const url = location.href;

const findUrlSettings = (websites: any, url: string) => {
  const convertWildcardToRegex = (pattern: string) => {
    return new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
  };

  const website = websites.find((website: { url: string }) => {
    const regex = convertWildcardToRegex(website.url);
    return regex.test(url);
  });

  return website;
};

chrome.runtime.onMessage.addListener(
  (
    message: Partial<AppState>,
    sender: any,
    sendResponse: (arg0: {
      status: string;
      message: Partial<AppState>;
      sender: any;
      sendResponse: any;
    }) => void
  ) => {
    if (message.isOn) {
      hideElementsIfSettingIsActivated();
      return;
    } else {
      showElements();
    }

    if (message.websites) {
      const isCurrentUrlActive = findUrlSettings(message.websites, url).active;

      if (isCurrentUrlActive) {
        hideElements();
      } else {
        showElements();
      }
    }

    sendResponse({ status: "received", message, sender, sendResponse });
  }
);

const manipulateElements = (hide: boolean) => {
  const elements = document.querySelectorAll("a");

  elements.forEach((element) => {
    const childsDiv = element.querySelectorAll("div");

    childsDiv.forEach((child) => {
      const regex = /puretech/i;
      if (child.textContent && regex.test(child.textContent)) {
        if (hide) {
          element.style.display = "none";
          if (
            element.parentElement &&
            element.parentElement.className === "searchCard"
          ) {
            element.parentElement.style.display = "none";
          }
        } else {
          element.style.display = "flex";
          if (
            element.parentElement &&
            element.parentElement.className === "searchCard"
          ) {
            element.parentElement.style.display = "flex";
          }
        }
      }
    });
  });
};

const hideElements = () => {
  manipulateElements(true);
};

const showElements = () => {
  manipulateElements(false);
};

const hideElementsIfSettingIsActivated = () => {
  chrome.storage.sync.get(["websites"], (results: { websites: any }) => {
    const matchedWebsite = findUrlSettings(results.websites, url);

    if (matchedWebsite.active) {
      hideElements();
    } else {
      showElements();
    }
  });
};

// main function

const main = () => {
  chrome.storage.sync.get(
    ["isOn", "websites"],
    (results: { isOn: any; websites: any }) => {
      let { isOn, websites } = results;
      if (!isOn) {
        // set default value
        chrome.storage.sync.set({ isOn: initialState.isOn });
        hideElementsIfSettingIsActivated();
      }

      if (!websites) {
        websites = initialState.websites;
        // set default value
        chrome.storage.sync.set({
          websites: websites,
        });
        hideElements();

        return;
      }

      const matchedWebsite = findUrlSettings(websites, url);

      if (isOn && matchedWebsite.active) {
        hideElements();
      } else {
        showElements();
      }
    }
  );
};

main();
