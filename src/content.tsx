import { initialState } from "./store/initialState";
import { AppState } from "./types/state";
import { toggleAd } from "./utils/motorHiddingMethods";

declare const browser: any;

const url = location.href;

/**
 * Finds the settings for a given URL from a list of websites.
 *
 * @param websites - An array of website objects, each containing a `url` property.
 * @param url - The URL to find settings for.
 * @returns The website object that matches the given URL, or `undefined` if no match is found.
 *
 * The function converts wildcard patterns in the website URLs to regular expressions
 * and tests them against the provided URL.
 */
function findUrlSettings(websites: any, url: string): any {
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
}

// Event listener for messages from the background script
browser.runtime.onMessage.addListener(
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
    if (message.websites) {
      const isCurrentUrlActive = findUrlSettings(message.websites, url).active;

      if (isCurrentUrlActive) {
        toggleAd(true);
      } else {
        toggleAd(false);
      }
    }

    sendResponse({ status: "received", message, sender, sendResponse });
  }
);

// main function

function main() {
  browser.storage.sync.get(["websites"], (results: { websites: any }) => {
    let { websites } = results;
    if (!websites) {
      websites = initialState.websites;
      // set default value
      browser.storage.sync.set({
        websites: websites,
      });
      toggleAd(true);

      return;
    }

    const matchedWebsite = findUrlSettings(websites, url);

    if (matchedWebsite.active) {
      toggleAd(true);
    } else {
      toggleAd(false);
    }
  });
}

main();
