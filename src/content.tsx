import { initialState } from "./store/initialState";
import { AppState, Motor } from "./types/state";
import { toggleAd } from "./utils/motorHiddingMethods";

declare const browser: any;

const url = location.href;

function findUrlSettings(websites: any, url: string): any {
  const convertWildcardToRegex = (pattern: string) =>
    new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
  return websites.find((website: { url: string }) =>
    convertWildcardToRegex(website.url).test(url)
  );
}

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
    if (message.websites || message.motors) {
      const websites = message.websites ?? initialState.websites;
      const motors: Motor[] = message.motors ?? initialState.motors;

      const matchedSite = findUrlSettings(websites, url);
      if (!matchedSite) return;

      const activeMotors = matchedSite.active
        ? motors.filter((m) => m.active)
        : [];

      toggleAd(matchedSite.active && activeMotors.length > 0, activeMotors);
    }

    sendResponse({ status: "received", message, sender, sendResponse });
  }
);

function main() {
  browser.storage.sync.get(
    ["websites", "motors"],
    (results: { websites?: any; motors?: Motor[] }) => {
      let { websites, motors } = results;

      if (!websites) {
        websites = initialState.websites;
        browser.storage.sync.set({ websites });
      }
      if (!motors) {
        motors = initialState.motors;
        browser.storage.sync.set({ motors });
      }

      const matchedWebsite = findUrlSettings(websites, url);
      if (!matchedWebsite) return;

      const activeMotors = matchedWebsite.active
        ? motors.filter((m: Motor) => m.active)
        : [];

      toggleAd(matchedWebsite.active && activeMotors.length > 0, activeMotors);
    }
  );
}

main();
